const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool({
  user: "minhakim",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const values = [email];
  const query = `
  SELECT * FROM users
  WHERE email = $1
  `;

  return pool.query(query, values).then((result) => {
    console.log(result.rows[0]);
    return result.rows[0];
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const values = [id];
  const query = `
  SELECT * FROM users
  WHERE id = $1
  `;

  return pool
    .query(query, values)
    .then((result) => {
      console.log(result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const values = [user.name, user.email, user.password];
  console.log("values", values);
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  return pool.query(query, values).then((result) => {
    console.log(result.rows[0]);
    return result.rows[0].id;
  });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const values = [guest_id, limit];
  const query = `SELECT reservations.id, properties.title, properties.cost_per_night,
  reservations.start_date, avg(property_reviews.rating) as average_rating,
  properties.number_of_bathrooms, properties.number_of_bedrooms, properties.parking_spaces,
  properties.thumbnail_photo_url

  FROM properties
  JOIN reservations ON properties.id = property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.title, properties.cost_per_night, properties.number_of_bathrooms,properties.number_of_bedrooms, properties.parking_spaces, properties.thumbnail_photo_url
  ORDER BY start_date DESC
  LIMIT $2;`;

  return pool.query(query, values).then((result) => {
    console.log(result.rows);
    return result.rows;
  });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // console.log(options, "options");
  // console.log(queryParams, "queryParams");

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    if (queryParams.length > 0) {
      queryString += `AND owner_id = $${queryParams.length}`;
    } else {
      queryString += `WHERE owner_id = $${queryParams.length}`;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    if (queryParams.length > 0) {
      queryParams.push(
        options.minimum_price_per_night,
        options.maximum_price_per_night
      );
      queryString += `AND cost_per_night BETWEEN $${
        queryParams.length - 1
      } AND $${queryParams.length}`;
    } else {
      queryParams.push(
        options.minimum_price_per_night,
        options.maximum_price_per_night
      );
      queryString += `WHERE properties.cost_per_night BETWEEN $${
        queryParams.length - 1
      } AND $${queryParams.length}`;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);

    if (queryParams.length > 0) {
      queryString += `AND rating >= $${queryParams.length}`;
    } else {
      queryString += `WHERE rating >= $${queryParams.length}`;
    }
  }

  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  // console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};

//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// };
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const values = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
  ];

  const query = `
    INSERT INTO properties (owner_id,
      title, 
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  return pool.query(query, values).then((result) => {
    console.log(result.rows);
    return result.rows;
  });

  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);
};
exports.addProperty = addProperty;
