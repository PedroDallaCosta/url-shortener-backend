const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRESQL_USER,
  host: process.env.POSTGRESQL_HOST,
  database: process.env.POSTGRESQL_DATABASE,
  password: process.env.POSTGRESQL_PASSWORD,
  port: 5432,
  max: 10,           
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
});

module.exports = pool;