const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRESQL_USER,
  host: process.env.POSTGRESQL_HOST,
  database: process.env.POSTGRESQL_DATABASE,
  password: process.env.POSTGRESQL_PASSWORD,
  port: Number(process.env.POSTGRESQL_PORT),
});

module.exports = pool;