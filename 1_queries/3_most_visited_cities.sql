-- list of the most visited cities
-- properties.city, reservations
SELECT properties.city, count(reservations) as total_reservations
FROM properties
JOIN reservations ON properties.id = property_id 
GROUP BY properties.city
ORDER BY total_reservations DESC;