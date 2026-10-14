# Quickstart: Linux Setup

### 1. Install Dependencies (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 nodejs npm python3 python3-pip
sudo usermod -aG docker $USER && newgrp docker
pip install pandas matplotlib --break-system-packages 2>/dev/null || pip install pandas matplotlib
```

### 2. Download Dataset
```bash
mkdir -p ~/Downloads && cd ~/Downloads
curl -O https://files.grouplens.org/datasets/movielens/ml-25m.zip
unzip ml-25m.zip
```

### 3. Run Pipeline (Phases 1-5)
```bash
cd /path/to/BDA
chmod +x run_all.sh sync-data.sh
./run_all.sh ~/Downloads/ml-25m
```

### 4. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---
### Web UIs
- HDFS: http://localhost:9870
- YARN: http://localhost:8088
- Stop cluster: `docker compose down`
