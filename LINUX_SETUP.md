# Linux Setup & Execution Guide: MovieLens Analytics on Hadoop

This guide walks through setting up and running the entire Hadoop + Hive + MapReduce + React pipeline on any Linux distribution (Ubuntu, Debian, Fedora, Arch, WSL2).

---

## 1. Prerequisites (Install Once)

Install Docker, Docker Compose, Node.js, and Python:

### Ubuntu / Debian:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 nodejs npm python3 python3-pip
sudo usermod -aG docker $USER
newgrp docker
```

---

## 2. Download MovieLens 25M Dataset

```bash
mkdir -p ~/Downloads/ml-25m
cd ~/Downloads/ml-25m
curl -O https://files.grouplens.org/datasets/movielens/ml-25m.zip
unzip ml-25m.zip
# Verifies files: movies.csv, ratings.csv, tags.csv
```

---

## 3. Clone / Enter Project Directory

```bash
cd ~/path/to/BDA
chmod +x run_all.sh sync-data.sh
```

---

## 4. Run the Pipeline (Phases 1 to 5)

Pass the path to your unzipped dataset:

```bash
./run_all.sh ~/Downloads/ml-25m/ml-25m
```

This single script:
1. Starts the 5 Docker containers (`namenode`, `datanode`, `resourcemanager`, `nodemanager`, `hiveserver2`).
2. Configures HDFS directory permissions (`/tmp`, `/user/hive/warehouse`).
3. Ingests `movies.csv`, `ratings.csv` (646MB), and `tags.csv` into HDFS.
4. Executes Beeline DDL to create external tables and runs the 6 analytical queries into `exports/*.csv`.
5. Executes the MapReduce WordCount job on `tags.csv`.
6. Generates 5 Matplotlib charts into `charts/`.
7. Syncs data and cluster logs into `frontend/public/data/`.

---

## 5. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **http://localhost:3000** (or `5173`)

---

## 6. Useful Linux Commands

| Action | Command |
|---|---|
| Stop cluster | `docker compose down` |
| View cluster status | `docker compose ps` |
| Check HDFS contents | `docker exec namenode hdfs dfs -ls /movielens/*` |
| HDFS Web UI | [http://localhost:9870](http://localhost:9870) |
| YARN Web UI | [http://localhost:8088](http://localhost:8088) |
| Hive Web UI | [http://localhost:10002](http://localhost:10002) |
