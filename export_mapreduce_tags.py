import os
import re
import subprocess

out_path = os.path.join("exports", "tag_wordcount.csv")
res = subprocess.run(
    ["docker", "exec", "resourcemanager", "hdfs", "dfs", "-cat", "/output/tag_wordcount/part-r-00000"],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)

rows = []
for line in res.stdout.splitlines():
    parts = line.strip().split("\t")
    if len(parts) == 2:
        word = re.sub(r'[^a-zA-Z0-9_\- ]', '', parts[0]).strip()
        if word and not word.isdigit() and len(word) > 2:
            try:
                count = int(parts[1])
                rows.append((word, count))
            except ValueError:
                pass

rows.sort(key=lambda x: x[1], reverse=True)

with open(out_path, "w", encoding="utf-8") as f:
    f.write("word,count\n")
    for w, c in rows[:100]:
        f.write(f"{w},{c}\n")

print(f"Saved {min(len(rows), 100)} tags to {out_path}")
