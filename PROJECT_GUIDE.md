# MovieLens Rating Analytics: Complete Project & Architecture Guide

## 1. Project Overview & Syllabus Alignment
- **Domain:** Big Data Analytics (BDA) Lab Project.
- **Syllabus Target:** LO1 — Big Data Fundamentals, Distributed Storage (HDFS), Distributed SQL Warehousing (Hive), and Batch Compute (MapReduce).
- **Dataset:** MovieLens 25M (`ratings.csv` ~646MB, `movies.csv` ~3MB, `tags.csv` ~38MB), containing 25 million ratings across 62,000+ movies.
- **Objective:** Demonstrating end-to-end distributed data engineering: ingestion into a distributed filesystem, schema-on-read modeling, analytical batch SQL aggregations, unstructured text MapReduce tokenization, and presentation via a reactive dashboard.

---

## 2. Technology Stack: What We Used, Why, and How

### A. Hadoop Distributed File System (HDFS 3.3.6)
* **Why we used it:**
  * Relational DBMSs struggle to store and stream high-volume append-only datasets without row locking and indexing overhead.
  * HDFS provides fault-tolerant, horizontally scalable block storage optimized for high-throughput sequential reads.
* **How it works in our project:**
  * **NameNode (`namenode` container):** Maintains the directory namespace tree (`/movielens/movies`, `/movielens/ratings`, `/movielens/tags`) and metadata mapping file blocks to storage nodes.
  * **DataNode (`datanode` container):** Stores the raw physical 128MB data blocks.
  * **Replication Factor:** Explicitly configured to `dfs.replication=1` in `hadoop.env` because our environment is a single-node local Docker development cluster.
  * **Auto-format Logic:** Set `ENSURE_NAMENODE_DIR=/tmp/hadoop-hadoop/dfs/name` so the NameNode automatically formats HDFS on first startup under user `hadoop` without manual intervention or corrupting named volumes.

---

### B. Apache YARN (ResourceManager & NodeManager)
* **Why we used it:**
  * Distributed compute engines need centralized resource negotiation (CPU vcores and RAM allocation) across worker nodes.
* **How it works in our project:**
  * **ResourceManager (`resourcemanager` container):** Arbitrates cluster compute resources and schedules submitted jobs.
  * **NodeManager (`nodemanager` container):** Tracks local container resources (memory/CPU) and launches task execution containers.
  * **Deadlock Prevention Configuration:**
    * In standard setups, `MRAppMaster` requests 1536MB of RAM and Map tasks request 1024MB. On a 2048MB local setup, `MRAppMaster` starves Map tasks of memory (preemption loop).
    * We resolved this by allocating 3072MB to NodeManager in `hadoop.env` and setting container sizes to 512MB (`-Xmx384m`) with `yarn.scheduler.minimum-allocation-mb=256`.

---

### C. Apache Hive (Hive 4.0.0 with HiveServer2 & Beeline)
* **Why we used it:**
  * Writing raw Java MapReduce jobs for every analytical aggregation (group-by, join, filter) is slow and complex.
  * Hive introduces **Schema-on-Read**, allowing SQL (HiveQL) queries to run over raw files stored directly in HDFS without moving or transforming the data.
* **Why Hive External Tables (not Managed/Internal)?**
  * **Managed Tables:** Hive assumes ownership of both schema and files. If someone runs `DROP TABLE`, Hive deletes the raw CSV files from HDFS.
  * **External Tables:** Hive stores only the column schema in its metastore. The data remains independent in `/movielens/*`. Dropping the table only deletes metadata—the dataset stays untouched.
* **Why OpenCSVSerde?**
  * Movie titles and tag strings often contain commas (e.g., `"Shawshank Redemption, The (1994)"`).
  * Plain delimited text splits blindly on every comma, corrupting columns. `OpenCSVSerde` properly parses quotation marks (`"`), preventing column misalignment.
* **Embedded Derby Metastore:**
  * Rather than deploying a separate PostgreSQL container and standalone metastore service (which frequently crashes on low-memory setups), we used Hive's built-in embedded Apache Derby engine, initialized automatically on first boot.
* **Execution Engine:**
  * Hive 4.0 uses Apache Tez in local JVM container mode to pipeline execution without submitting heavyweight separate DAGs to YARN, delivering fast query times (~15–20s for 25M rows).

---

### D. MapReduce (Native Java Hadoop Examples)
* **Why we used it:**
  * Demonstrates foundational Distributed Batch Processing following the Map $\rightarrow$ Shuffle & Sort $\rightarrow$ Reduce paradigm.
* **How it works in our project:**
  * **Input:** The raw free-form user tags file (`/movielens/tags/tags.csv`, ~38MB).
  * **Map Phase:** Scans the input text line-by-line and tokenizes words into key-value pairs: `<word, 1>`.
  * **Shuffle & Sort:** Partitions and sorts intermediate keys so that identical words are routed to the same Reducer.
  * **Reduce Phase:** Sums occurrences for each unique word and outputs: `<word, total_count>` to `/output/tag_wordcount/part-r-00000` in HDFS.

---

### E. Python (Pandas & Matplotlib)
* **Why we used it:**
  * Big Data engines aggregate massive raw inputs into compact summary tables. Python is used downstream to consume these exported summaries and render visual charts.
* **Role:**
  * Reads the UTF-8/BOM clean CSV exports from `exports/`.
  * Renders 5 static report charts in `charts/` for project documentation and thesis submission.

---

### F. React + Vite Frontend (Neo-Brutalism Theme)
* **Why we used it:**
  * Translates raw terminal commands and CSV exports into an interactive, visual dashboard for lab evaluators and professors.
* **Design Philosophy:**
  * **Neo-Brutalism:** Bold flat colors (yellow `#FFD93D`, pink `#FF6B9D`, blue `#4D96FF`, green `#6BCB77`), 3px solid black borders, hard offset drop shadows (`6px 6px 0px #000`), and monospace fonts (`Space Mono`, `Space Grotesk`).
  * **Runtime Transparency:** Displays live container statuses, HDFS cluster health, and terminal logs from HiveServer2, NameNode, and YARN alongside query charts and data tables.

---

## 3. Data Flow Architecture

```
[Raw MovieLens 25M Dataset]
       │
       ▼ (docker cp + hdfs dfs -put)
[HDFS Storage: /movielens/] ───► [MapReduce WordCount Job]
       │                                     │
       ▼ (Hive External Tables)              ▼
[HiveServer2 (Tez Local Engine)]      [HDFS Output: /output/tag_wordcount]
       │                                     │
       ▼ (Beeline CSV2 Exports)              ▼ (Python Parser)
[Local exports/*.csv] ───────────────► [exports/tag_wordcount.csv]
       │                                     │
       ├───────────────────┬─────────────────┘
       ▼                   ▼
[Matplotlib Charts]   [sync-data script]
                           │
                           ▼
                 [React Dashboard UI]
```

---

## 4. Analytical Workloads Executed

| # | Query Goal | HiveQL Technique | Key Finding |
|---|---|---|---|
| **1** | Total Ratings Count | `COUNT(*)` | Exactly 25,000,095 ratings recorded. |
| **2** | Rating Distribution | `GROUP BY rating ORDER BY rating` | Ratings 4.0 and 3.0 are the most frequent; half-star ratings are less common. |
| **3** | Most Rated Movies | `JOIN movies ... ORDER BY total_reviews DESC LIMIT 10` | *Forrest Gump* (81.4k) and *The Shawshank Redemption* (81.4k) lead in volume. |
| **4** | Highest Rated (>1k votes) | `JOIN ... HAVING count >= 1000 ORDER BY avg_rating DESC` | *Planet Earth II* (4.48) and *Planet Earth* (4.46) top the list. |
| **5** | Ratings Over Time | `from_unixtime(rating_time, 'yyyy') ... GROUP BY year` | Activity peaked between 2000 and 2016, mirroring web adoption. |
| **6** | Genre Breakdown | `LATERAL VIEW explode(split(genres, '\\|'))` | Drama (25.6k) and Comedy (16.8k) represent the largest share of catalogued films. |
| **7** | Top Active Users | `GROUP BY userId ORDER BY count DESC LIMIT 10` | User ID `72315` contributed over 32,200 individual ratings. |

---

## 5. Summary of Engineering Challenges Solved

1. **Memory Starvation in Docker YARN:** Tuned container memory (`am.resource.mb=512`, `map.memory.mb=512`) and expanded NodeManager memory to 3072MB, eliminating container preemption deadlocks.
2. **Hive Metastore Simplicity:** Replaced failure-prone multi-container PostgreSQL setups with an embedded Derby metastore initialized automatically by Hive 4.0.0.
3. **Delimiter & Quoting Safety:** Implemented `OpenCSVSerde` for CSVs with embedded commas in titles and tags.
4. **Reserved Word Handling:** Escaped conflicting SQL identifiers like `timestamp` by mapping them cleanly to `rating_time` and `tag_time`.
5. **Cross-Platform Compatibility:** Created unified PowerShell (`.ps1`) and Linux Bash (`.sh`) runners supporting identical workflows across Windows 11 and Linux distributions.
