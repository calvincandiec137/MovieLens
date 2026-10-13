SELECT count(*) AS total_ratings FROM ratings;

SELECT rating, count(*) AS rating_count 
FROM ratings 
GROUP BY rating 
ORDER BY rating;

SELECT m.title, count(r.rating) AS total_reviews, round(avg(r.rating), 2) AS avg_rating
FROM ratings r
JOIN movies m ON r.movieId = m.movieId
GROUP BY m.title
ORDER BY total_reviews DESC
LIMIT 10;

SELECT m.title, count(r.rating) AS review_count, round(avg(r.rating), 2) AS avg_rating
FROM ratings r
JOIN movies m ON r.movieId = m.movieId
GROUP BY m.title
HAVING count(r.rating) >= 1000
ORDER BY avg_rating DESC
LIMIT 10;

SELECT from_unixtime(timestamp, 'yyyy') AS release_year, count(*) AS ratings_count
FROM ratings
GROUP BY from_unixtime(timestamp, 'yyyy')
ORDER BY release_year;

SELECT explode(split(genres, '\\|')) AS genre, count(*) AS movie_count
FROM movies
GROUP BY explode(split(genres, '\\|'))
ORDER BY movie_count DESC;

SELECT g.genre, round(avg(r.rating), 2) AS avg_rating, count(r.rating) AS rating_count
FROM (
    SELECT movieId, explode(split(genres, '\\|')) AS genre
    FROM movies
) g
JOIN ratings r ON g.movieId = r.movieId
GROUP BY g.genre
ORDER BY avg_rating DESC;

SELECT userId, count(*) AS ratings_given, round(avg(rating), 2) AS avg_rating
FROM ratings
GROUP BY userId
ORDER BY ratings_given DESC
LIMIT 10;
