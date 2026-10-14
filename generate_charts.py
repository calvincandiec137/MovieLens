import os
import re
import pandas as pd
import matplotlib.pyplot as plt

os.makedirs("charts", exist_ok=True)

def load_csv_two_cols(filepath, col1, col2):
    rows = []
    with open(filepath, "r", encoding="utf-8-sig") as f:
        lines = [line.strip() for line in f if line.strip()]
    for line in lines[1:]:
        match = re.match(r"^(.*),([^,]+)$", line)
        if match:
            rows.append({col1: match.group(1).strip(), col2: match.group(2).strip()})
    return pd.DataFrame(rows)

def load_csv_three_cols(filepath, col1, col2, col3):
    rows = []
    with open(filepath, "r", encoding="utf-8-sig") as f:
        lines = [line.strip() for line in f if line.strip()]
    for line in lines[1:]:
        match = re.match(r"^(.*),([^,]+),([^,]+)$", line)
        if match:
            rows.append({col1: match.group(1).strip(), col2: match.group(2).strip(), col3: match.group(3).strip()})
    return pd.DataFrame(rows)

df_dist = pd.read_csv("exports/rating_distribution.csv", encoding="utf-8-sig")
df_dist.columns = [c.strip() for c in df_dist.columns]
plt.figure(figsize=(8, 5))
plt.bar(df_dist["rating"].astype(str), df_dist["rating_count"].astype(float), color="#3498db", edgecolor="black")
plt.xlabel("Rating")
plt.ylabel("Count")
plt.title("Distribution of Movie Ratings")
plt.tight_layout()
plt.savefig("charts/01_rating_distribution.png")
plt.close()

df_most = load_csv_two_cols("exports/most_rated_movies.csv", "title", "total_reviews")
plt.figure(figsize=(10, 6))
plt.barh(df_most["title"][::-1], df_most["total_reviews"].astype(float)[::-1], color="#2ecc71", edgecolor="black")
plt.xlabel("Number of Reviews")
plt.title("Top 10 Most Rated Movies")
plt.tight_layout()
plt.savefig("charts/02_most_rated_movies.png")
plt.close()

df_year = pd.read_csv("exports/ratings_per_year.csv", encoding="utf-8-sig")
df_year.columns = [c.strip() for c in df_year.columns]
plt.figure(figsize=(10, 5))
plt.plot(df_year["rating_year"].astype(str), df_year["ratings_count"].astype(float), marker="o", color="#e74c3c", linewidth=2)
plt.xticks(rotation=45)
plt.xlabel("Year")
plt.ylabel("Number of Ratings")
plt.title("Ratings Activity Over Years")
plt.tight_layout()
plt.savefig("charts/03_ratings_per_year.png")
plt.close()

df_genre = pd.read_csv("exports/genre_distribution.csv", encoding="utf-8-sig")
df_genre.columns = [c.strip() for c in df_genre.columns]
plt.figure(figsize=(10, 6))
plt.bar(df_genre["genre"], df_genre["movie_count"].astype(float), color="#9b59b6", edgecolor="black")
plt.xticks(rotation=60, ha="right")
plt.xlabel("Genre")
plt.ylabel("Movie Count")
plt.title("Movies Count by Genre")
plt.tight_layout()
plt.savefig("charts/04_genre_distribution.png")
plt.close()

df_user = pd.read_csv("exports/most_active_users.csv", encoding="utf-8-sig")
df_user.columns = [c.strip().lower() for c in df_user.columns]
plt.figure(figsize=(8, 5))
plt.bar(df_user["userid"].astype(str), df_user["ratings_given"].astype(float), color="#f39c12", edgecolor="black")
plt.xlabel("User ID")
plt.ylabel("Total Ratings Given")
plt.title("Top 10 Most Active Users")
plt.tight_layout()
plt.savefig("charts/05_most_active_users.png")
plt.close()
print("Charts successfully generated.")
