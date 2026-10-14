$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exportDir = Join-Path $scriptDir "exports"
$targetDir = Join-Path $scriptDir "frontend\public\data"

if (-not (Test-Path $exportDir)) {
    Write-Host "Error: exports/ folder does not exist. Run run_all.ps1 first." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
Copy-Item -Path "$exportDir\*.csv" -Destination $targetDir -Force

$statusObj = @{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    containers = @(
        @{ name = "namenode"; role = "HDFS Master"; status = (docker inspect --format '{{.State.Status}} ({{.State.Health.Status}})' namenode 2>$null) },
        @{ name = "datanode"; role = "HDFS Worker"; status = (docker inspect --format '{{.State.Status}}' datanode 2>$null) },
        @{ name = "resourcemanager"; role = "YARN Master"; status = (docker inspect --format '{{.State.Status}}' resourcemanager 2>$null) },
        @{ name = "nodemanager"; role = "YARN Worker"; status = (docker inspect --format '{{.State.Status}}' nodemanager 2>$null) },
        @{ name = "hiveserver2"; role = "Hive SQL Engine"; status = (docker inspect --format '{{.State.Status}}' hiveserver2 2>$null) }
    )
    logs = @{
        namenode = (docker logs --tail 40 namenode 2>&1 | Out-String)
        hiveserver2 = (docker logs --tail 40 hiveserver2 2>&1 | Out-String)
        resourcemanager = (docker logs --tail 40 resourcemanager 2>&1 | Out-String)
    }
}
$statusObj | ConvertTo-Json -Depth 4 | Out-File -Encoding utf8 "$targetDir\cluster_logs.json"

Write-Host "Synced CSVs and cluster live logs to frontend/public/data/" -ForegroundColor Green
