#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/frontend/public/data"

mkdir -p "$TARGET_DIR"
cp -f "$SCRIPT_DIR/exports/"*.csv "$TARGET_DIR/"

cat <<EOF > "$TARGET_DIR/cluster_logs.json"
{
  "timestamp": "$(date '+%Y-%m-%d %H:%M:%S')",
  "containers": [
    { "name": "namenode", "role": "HDFS Master", "status": "$(docker inspect --format '{{.State.Status}} ({{.State.Health.Status}})' namenode 2>/dev/null || echo 'stopped')" },
    { "name": "datanode", "role": "HDFS Worker", "status": "$(docker inspect --format '{{.State.Status}}' datanode 2>/dev/null || echo 'stopped')" },
    { "name": "resourcemanager", "role": "YARN Master", "status": "$(docker inspect --format '{{.State.Status}}' resourcemanager 2>/dev/null || echo 'stopped')" },
    { "name": "nodemanager", "role": "YARN Worker", "status": "$(docker inspect --format '{{.State.Status}}' nodemanager 2>/dev/null || echo 'stopped')" },
    { "name": "hiveserver2", "role": "Hive SQL Engine", "status": "$(docker inspect --format '{{.State.Status}}' hiveserver2 2>/dev/null || echo 'stopped')" }
  ],
  "logs": {
    "namenode": $(docker logs --tail 30 namenode 2>&1 | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '""'),
    "hiveserver2": $(docker logs --tail 30 hiveserver2 2>&1 | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '""'),
    "resourcemanager": $(docker logs --tail 30 resourcemanager 2>&1 | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '""')
  }
}
EOF

echo "Synced CSV exports and live logs to frontend/public/data/"
