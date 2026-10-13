# Project Report Outline: MovieLens Rating Analytics using Hadoop, Hive and MapReduce

## 1. Introduction & Objectives
- Overview of Big Data Analytics and the MovieLens 25M dataset.
- Project objective: Distributed data ingestion, schema-on-read modeling, analytical batch processing, and MapReduce aggregation.
- Syllabus mapping: Learning Outcome 1 (LO1) - Big Data fundamentals, HDFS, Hive, and MapReduce.

## 2. Architecture & Technology Stack
- **Storage Layer**: Hadoop Distributed File System (HDFS 3.3.6) with single-node pseudo-distributed replication.
- **Compute Layer**: Apache Hadoop YARN (ResourceManager & NodeManager).
- **Data Warehousing & SQL**: Apache Hive 4.0.0 with embedded Derby metastore and external tables.
- **Batch Processing**: Hadoop MapReduce framework (examples wordcount jar).
- **Visualization**: Python (Pandas & Matplotlib).
- **Containerization**: Docker Compose running 5 decoupled containers.

## 3. Implementation Details
- **Phase 1: Environment Orchestration**: Docker compose definition, HDFS auto-formatting via `ENSURE_NAMENODE_DIR`, YARN resource constraints.
- **Phase 2: Data Ingestion into HDFS**: Transferring large CSV files (`movies.csv`, `ratings.csv`, `tags.csv`) to partitioned/structured HDFS paths (`/movielens/*`).
- **Phase 3: Hive External Tables & Analytical Queries**:
  - DDL schema creation using `skip.header.line.count`.
  - Analytical workloads: rating distributions, aggregations, joins, date/timestamp functions (`from_unixtime`), and lateral view exploded arrays (`split(genres, '\\|')`).
- **Phase 4: MapReduce Word Count Job**: Running MapReduce job on free-text user tags (`tags.csv`) to identify key themes.
- **Phase 5: Result Extraction & Visualization**: CSV export pipeline and generation of 5 analytical visual plots.

## 4. Key Results & Findings
- Summary of dataset metrics: total volume of ratings, most reviewed films, rating score variance, historical user activity peaks, dominant genres.

## 5. Conclusion & Future Scope
- Realized benefits of decoupled storage and compute.
- Potential extensions: Partitioned Parquet/ORC storage, real-time streaming using Spark/Kafka, collaborative filtering recommendation models.

---

# 15 Viva Questions and Concise Answers

### Q1: What is the role of HDFS, and how does it store files?
**Ans:** HDFS (Hadoop Distributed File System) stores large files by splitting them into fixed-size blocks (typically 128MB) and distributing them across DataNodes across a cluster for fault-tolerant, high-throughput access.

### Q2: What is the difference between NameNode and DataNode?
**Ans:** NameNode manages the filesystem namespace, directory tree, and metadata (block locations). DataNode stores the actual data blocks and serves read/write requests.

### Q3: What is the difference between Hive Managed and External tables?
**Ans:** Dropping a Managed table deletes both metadata and underlying HDFS data. Dropping an External table only deletes the Hive metadata; the data in HDFS remains untouched.

### Q4: Why did we use External tables in this project?
**Ans:** Because the raw dataset was already loaded into HDFS and managed independently. If the Hive table schema is dropped or recreated, the underlying MovieLens dataset is preserved.

### Q5: What does "Schema-on-Read" mean in Hive?
**Ans:** Hive does not validate or transform data when loading it into storage. It verifies and applies the schema dynamically when executing read queries.

### Q6: What is YARN and what are its primary daemons?
**Ans:** YARN (Yet Another Resource Negotiator) is Hadoop's cluster resource management system. Its primary daemons are the ResourceManager (global resource allocation) and NodeManager (monitors container resource usage on individual nodes).

### Q7: How does a MapReduce WordCount job work?
**Ans:** The Mapper tokenizes lines of text into `<word, 1>` pairs. Hadoop groups and sorts these pairs by key (shuffle and sort phase). The Reducer sums the occurrences for each unique word and outputs `<word, total_count>`.

### Q8: What is the purpose of HiveServer2 and Beeline?
**Ans:** HiveServer2 provides a multi-client execution service that accepts JDBC/ODBC connections. Beeline is the thin CLI client based on SQLLine used to submit SQL queries to HiveServer2.

### Q9: Why is `skip.header.line.count` used in table definition?
**Ans:** CSV files from MovieLens contain a header row with column names (`movieId,title,genres`). This table property prevents Hive from treating the header row as data.

### Q10: How did we parse multiple genres for a single movie in Hive?
**Ans:** We used `split(genres, '\\|')` to convert the pipe-delimited string into an array, and Hive's `explode()` UDTF to flatten array items into individual rows.

### Q11: What is an embedded Derby metastore, and what is its limitation?
**Ans:** Derby is a lightweight Java-based SQL database bundled with Hive that stores table metadata. Its limitation is that embedded Derby supports only one active connection at a time.

### Q12: Why disable virtual memory check (`vmem-check-enabled=false`) in Docker YARN?
**Ans:** Docker containers and WSL2 calculate allocated virtual memory differently than physical hosts. Hadoop YARN frequently kills containers on false-positive virtual memory limits unless disabled.

### Q13: What happens during the Shuffle and Sort phase in MapReduce?
**Ans:** Intermediate keys produced by mappers are partitioned, transferred over the network to the assigned reducers, and sorted by key so each reducer gets all values for a given key.

### Q14: How does Hive convert SQL queries into execution?
**Ans:** Hive parses SQL into an Abstract Syntax Tree (AST), optimizes the execution plan via its cost-based optimizer, and translates it into tasks executed via Tez, MapReduce, or Spark.

### Q15: Why is replication set to 1 in our setup?
**Ans:** We are running a single-node pseudo-distributed cluster inside Docker for development and lab demonstration. Additional replicas require multiple distinct DataNodes.
