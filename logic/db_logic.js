// Postgres access for referenceangle.com.
//
// Uses @neondatabase/serverless so it works in Vercel serverless functions.
// The connection pool is created lazily (on first query) from
// process.env.DATABASE_URL, so simply requiring this module never opens a
// connection or throws when DATABASE_URL is unset.

const { Pool } = require('@neondatabase/serverless');

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

module.exports = function (query, callback) {
  let client;
  try {
    client = getPool();
  } catch (e) {
    return callback(e);
  }

  client.query(query, (err, res) => {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback(null, res.rows);
  });
};
