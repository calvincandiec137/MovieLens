param(
    [string]$DatasetPath = "C:\Users\faizk\Downloads\ml-25m\ml-25m"
)

$ErrorActionPreference = "Continue"

function Fail($message) {
    Write-Host $message -ForegroundColor Red
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Test-Path "$DatasetPath\ratings.csv")) {
    Fail "Dataset files not found at $DatasetPath. Please verify the folder exists."
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Phase 1: Cluster Startup & HDFS Prep" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

docker compose up -d

Write-Host "Waiting for NameNode healthcheck..." -ForegroundColor Yellow
$retries = 30
$nnHealthy = $false
while ($retries -gt 0) {
    $status = docker inspect --format '{{.State.Health.Status}}' namenode 2>$null
    if ($status -eq "healthy") {
        Write-Host "NameNode is healthy." -ForegroundColor Green
        $nnHealthy = $true
        break
    }
    Start-Sleep -Seconds 3
    $retries--
}

if (-not $nnHealthy) {
    Fail "NameNode failed to report healthy in time. Check 'docker logs namenode'."
}

Write-Host "Configuring HDFS directories and permissions..." -ForegroundColor Yellow
docker exec namenode hdfs dfs -chmod 777 /
docker exec namenode hdfs dfs -mkdir -p /tmp /user/hive/warehouse /movielens/movies /movielens/ratings /movielens/tags
docker exec namenode hdfs dfs -chmod -R 777 /tmp /user /movielens

Write-Host "Checking HiveServer2 connection..." -ForegroundColor Yellow
$hiveRetries = 25
$hiveReady = $false
while ($hiveRetries -gt 0) {
    docker exec hiveserver2 beeline -u "jdbc:hive2://localhost:10000/default" -e "SHOW DATABASES;" >$null 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "HiveServer2 is ready and responsive." -ForegroundColor Green
        $hiveReady = $true
        break
    }
    Start-Sleep -Seconds 4
    $hiveRetries--
}

if (-not $hiveReady) {
    Fail "HiveServer2 did not become ready in time. Check 'docker logs hiveserver2'."
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Phase 2: Ingesting MovieLens Data into HDFS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

docker exec namenode hdfs dfs -test -e /movielens/ratings/ratings.csv
if ($LASTEXITCODE -eq 0) {
    Write-Host "MovieLens data already present in HDFS. Skipping re-upload." -ForegroundColor Green
} else {
    Write-Host "Copying movies.csv into HDFS..." -ForegroundColor Yellow
    docker cp "$DatasetPath\movies.csv" namenode:/tmp/movies.csv
    if ($LASTEXITCODE -ne 0) { Fail "Failed to copy movies.csv to namenode." }
    docker exec namenode hdfs dfs -put -f /tmp/movies.csv /movielens/movies/
    if ($LASTEXITCODE -ne 0) { Fail "Failed to upload movies.csv into HDFS." }
    docker exec -u root namenode rm -f /tmp/movies.csv

    Write-Host "Copying tags.csv into HDFS..." -ForegroundColor Yellow
    docker cp "$DatasetPath\tags.csv" namenode:/tmp/tags.csv
    if ($LASTEXITCODE -ne 0) { Fail "Failed to copy tags.csv to namenode." }
    docker exec namenode hdfs dfs -put -f /tmp/tags.csv /movielens/tags/
    if ($LASTEXITCODE -ne 0) { Fail "Failed to upload tags.csv into HDFS." }
    docker exec -u root namenode rm -f /tmp/tags.csv

    Write-Host "Copying ratings.csv (646 MB) into HDFS... (takes ~30-60s)" -ForegroundColor Yellow
    docker cp "$DatasetPath\ratings.csv" namenode:/tmp/ratings.csv
    if ($LASTEXITCODE -ne 0) { Fail "Failed to copy ratings.csv to namenode." }
    docker exec namenode hdfs dfs -put -f /tmp/ratings.csv /movielens/ratings/
    if ($LASTEXITCODE -ne 0) { Fail "Failed to upload ratings.csv into HDFS." }
    docker exec -u root namenode rm -f /tmp/ratings.csv
}

docker exec namenode hdfs dfs -ls /movielens/*

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Phase 3: Creating Hive Tables & Analytics" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

docker cp "hive-queries/01_create_tables.sql" hiveserver2:/tmp/01_create_tables.sql
if ($LASTEXITCODE -ne 0) { Fail "Failed to copy 01_create_tables.sql into hiveserver2." }

docker exec hiveserver2 beeline -u "jdbc:hive2://localhost:10000/default" -f /tmp/01_create_tables.sql
if ($LASTEXITCODE -ne 0) { Fail "Hive DDL execution failed." }

New-Item -ItemType Directory -Force -Path "exports" | Out-Null

Write-Host "Running analytics and saving outputs..." -ForegroundColor Yellow

$queries = @(
    @{
        File = "exports/rating_distribution.csv"
        Query = "SELECT rating, count(*) AS rating_count FROM ratings GROUP BY rating ORDER BY rating;"
    },
    @{
        File = "exports/most_rated_movies.csv"
        Query = "SELECT m.title, count(r.rating) AS total_reviews FROM ratings r JOIN movies m ON cast(r.movieId as int) = cast(m.movieId as int) GROUP BY m.title ORDER BY total_reviews DESC LIMIT 10;"
    },
    @{
        File = "exports/highest_rated_movies.csv"
        Query = "SELECT m.title, count(r.rating) AS review_count, round(avg(r.rating), 2) AS avg_rating FROM ratings r JOIN movies m ON cast(r.movieId as int) = cast(m.movieId as int) GROUP BY m.title HAVING count(r.rating) >= 1000 ORDER BY avg_rating DESC LIMIT 10;"
    },
    @{
        File = "exports/ratings_per_year.csv"
        Query = "SELECT from_unixtime(rating_time, 'yyyy') AS rating_year, count(*) AS ratings_count FROM ratings GROUP BY from_unixtime(rating_time, 'yyyy') ORDER BY rating_year;"
    },
    @{
        File = "exports/genre_distribution.csv"
        Query = "SELECT gen.genre, count(*) AS movie_count FROM movies LATERAL VIEW explode(split(genres, '\\|')) gen AS genre GROUP BY gen.genre ORDER BY movie_count DESC;"
    },
    @{
        File = "exports/most_active_users.csv"
        Query = "SELECT userId, count(*) AS ratings_given FROM ratings GROUP BY userId ORDER BY ratings_given DESC LIMIT 10;"
    }
)

foreach ($item in $queries) {
    Write-Host "Executing query for $($item.File)..." -ForegroundColor Gray
    docker exec hiveserver2 beeline -u "jdbc:hive2://localhost:10000/default" --silent=true --outputformat=csv2 --hiveconf hive.resultset.use.unique.column.names=false -e "$($item.Query)" 2>$null | Out-File -Encoding utf8 "$($item.File)"
    if ($LASTEXITCODE -ne 0) { Fail "Query execution failed for $($item.File)." }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Phase 4: MapReduce WordCount on Tags" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

docker exec resourcemanager hdfs dfs -rm -r -f /output/tag_wordcount 2>$null
docker exec resourcemanager hadoop jar /opt/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.3.6.jar wordcount /movielens/tags /output/tag_wordcount
if ($LASTEXITCODE -ne 0) { Fail "MapReduce job failed." }

Write-Host "MapReduce WordCount Results Sample:" -ForegroundColor Green
docker exec resourcemanager hdfs dfs -cat /output/tag_wordcount/part-r-00000 | Select-Object -First 20

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Phase 5: Generating Matplotlib Charts" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

python -m pip install pandas matplotlib --quiet
if ($LASTEXITCODE -ne 0) { Fail "Failed to install Python dependencies." }

python generate_charts.py
if ($LASTEXITCODE -ne 0) { Fail "Chart generation failed." }

Write-Host "`nSUCCESS: All phases completed!" -ForegroundColor Green

if (Test-Path "$scriptDir\charts") {
    Write-Host "Charts saved in: $scriptDir\charts" -ForegroundColor Green
}
if (Test-Path "$scriptDir\REPORT_AND_VIVA.md") {
    Write-Host "Project report outline & viva questions: $scriptDir\REPORT_AND_VIVA.md" -ForegroundColor Green
}
