#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DATASET_PATH="${1:-$HOME/Downloads/ml-25m/ml-25m}"

if [ ! -f "$DATASET_PATH/ratings.csv" ]; then
    echo "Error: Dataset not found at $DATASET_PATH"
    echo "Usage: ./run_all.sh [path_to_ml_25m]"
    exit 1
fi

echo "=== Phase 1: Starting Hadoop & Hive Cluster ==="
docker compose up -d

echo "Waiting for NameNode to be healthy..."
until [ "$(docker inspect --format '{{.State.Health.Status}}' namenode 2>/dev/null)" = "healthy" ]; do
    sleep 3
done
echo "NameNode is healthy."

echo "Configuring HDFS permissions..."
docker exec namenode hdfs dfs -chmod 777 /
docker exec namenode hdfs dfs -mkdir -p /tmp /user/hive/warehouse /movielens/movies /movielens/ratings /movielens/tags
docker exec namenode hdfs dfs -chmod -R 777 /tmp /user /movielens

echo "Waiting for HiveServer2..."
until docker exec hiveserver2 beeline -u "jdbc:hive2://localhost:10000/default" -e "SHOW DATABASES;" >/dev/null 2>&1; do
    sleep 4
done
echo "HiveServer2 is ready."

echo "=== Phase 2: Ingesting Data into HDFS ==="
if docker exec namenode hdfs dfs -test -e /movielens/ratings/ratings.csv; then
    echo "Data already exists in HDFS. Skipping upload."
else
    echo "Copying movies.csv..."
    docker cp "$DATASET_PATH/movies.csv" namenode:/tmp/movies.csv
    docker exec namenode hdfs dfs -put -f /tmp/movies.csv /movielens/movies/
    docker exec -u root namenode rm -f /tmp/movies.csv

    echo "Copying tags.csv..."
    docker cp "$DATASET_PATH/tags.csv" namenode:/tmp/tags.csv
    docker exec namenode hdfs dfs -put -f /tmp/tags.csv /movielens/tags/
    docker exec -u root namenode rm -f /tmp/tags.csv

    echo "Copying ratings.csv (~646 MB)..."
    docker cp "$DATASET_PATH/ratings.csv" namenode:/tmp/ratings.csv
    docker exec namenode hdfs dfs -put -f /tmp/ratings.csv /movielens/ratings/
    docker exec -u root namenode rm -f /tmp/ratings.csv
fi

echo "=== Phase 3: Hive External Tables & Analytics ==="
docker cp "hive-queries/01_create_tables.sql" hiveserver2:/tmp/01_create_tables.sql
docker exec hiveserver2 beeline -u "jdbc:hive2://localhost:10000/default" -f /tmp/01_create_tables.sql

mkdir -p exports

declare -A QUERIES=(
    ["exports/rating_distribution.csv"]="SELECT rating, count(*) AS rating_count FROM ratings GROUP BY rating ORDER BY rating;"
    ["exports/most_rated_movies.csv"]="SELECT m.title, count(r.rating) AS total_reviews FROM ratings r JOIN movies m ON cast(r.movieId as int) = cast(m.movieId as int) GROUP BY m.title ORDER BY total_reviews DESC LIMIT 10;"
    ["exports/highest_rated_movies.csv"]="SELECT m.title, count(r.rating) AS review_count, round(avg(r.rating), 2) AS avg_rating FROM ratings r JOIN movies m ON cast(r.movieId as int) = cast(m.movieId as int) GROUP BY m.title HAVING count(r.rating) >= 1000 ORDER BY avg_rating DESC LIMIT 10;"
    ["exports/ratings_per_year.csv"]="SELECT from_unixtime(rating_time, 'yyyy') AS rating_year, count(*) AS ratings_count FROM ratings GROUP BY from_unixtime(rating_time, 'yyyy') ORDER BY rating_year;"
    ["exports/genre_distribution.csv"]="SELECT gen.genre, count(*) AS movie_count FROM movies LATERAL VIEW explode(split(genres, '\\|')) gen AS genre GROUP BY gen.genre ORDER BY movie_count DESC;"
    ["exports/most_active_users.csv"]="SELECT userId, count(*) AS ratings_given FROM ratings GROUP BY userId ORDER BY ratings_given DESC LIMIT 10;"
)

for file in "${!QUERIES[@]}"; do
    echo "Running query for $file..."
    docker exec hiveserver2 beeline -u "jdbc:hive2://localhost:10000/default" --silent=true --outputformat=csv2 --hiveconf hive.resultset.use.unique.column.names=false -e "${QUERIES[$file]}" > "$file"
done

echo "=== Phase 4: MapReduce WordCount on Tags ==="
docker exec resourcemanager hdfs dfs -rm -r -f /output/tag_wordcount 2>/dev/null || true
docker exec resourcemanager hadoop jar /opt/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.3.6.jar wordcount /movielens/tags /output/tag_wordcount

python3 export_mapreduce_tags.py

echo "=== Phase 5: Generating Matplotlib Charts ==="
pip install pandas matplotlib --quiet || pip3 install pandas matplotlib --quiet
python3 generate_charts.py

./sync-data.sh

echo "SUCCESS: Hadoop pipeline completed. Charts saved in charts/ and synced to frontend/public/data/"
