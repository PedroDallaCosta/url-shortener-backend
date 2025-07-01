require('dotenv').config()
const { Client } = require('pg');

const commands = [
  `CREATE TABLE urls (
    short VARCHAR(8) PRIMARY KEY,
    owner INTEGER NOT NULL,
    url TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expire BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0
  );`,

  `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );`,

  `CREATE TABLE clicks_per_day(
    short VARCHAR(8) NOT NULL,
    data DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    PRIMARY KEY (short, data)
  )`
]

async function CreateTables() {
  try {
    const client = new Client({
      user: process.env.POSTGRESQL_USER,
      host: process.env.POSTGRESQL_HOST,
      password: process.env.POSTGRESQL_PASSWORD,
      database: process.env.POSTGRESQL_DATABASE,
      port: 5432,
    });

    await client.connect();

    await Promise.all(
      commands.map(async (command) => {
        await client.query(command);
      })
    )

    console.log('Tables created!');
    await client.end();
  } catch (erro) {
    console.error(`Erro in connection with ${process.env.POSTGRESQL_DATABASE}: `, erro.message)
  }
}

async function criarBanco() {
  const client = new Client({
    user: process.env.POSTGRESQL_USER,
    host: process.env.POSTGRESQL_HOST,
    password: process.env.POSTGRESQL_PASSWORD,
    database: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE ${process.env.POSTGRESQL_DATABASE};`);

    console.log(`Database "${process.env.POSTGRESQL_DATABASE}" create!`);
  } catch (err) {
    if (err.code === '42P04') {
      console.warn(`Database "${DB_NAME}" already exists.`);
    } else {
      console.error('Error creating database:', err.message);
    }
  } finally {
    await client.end();
  }

  await CreateTables()
}

criarBanco()