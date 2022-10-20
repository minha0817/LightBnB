-- properties, reservations, property_reviews
SELECT reservations.id, properties.title, properties.cost_per_night,
reservations.start_date, avg(property_reviews.rating) as average_rating
FROM properties
JOIN reservations ON properties.id = property_id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE owner_id = 1
GROUP BY reservations.id, properties.title, properties.cost_per_night
ORDER BY start_date DESC
LIMIT 10;