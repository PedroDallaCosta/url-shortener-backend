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
    unique_clicks INTEGER DEFAULT 0
  );`,

  `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email_verify BOOLEAN DEFAULT FALSE
  );`,

  `CREATE TABLE clicks_per_day(
    short VARCHAR(8) NOT NULL,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    PRIMARY KEY (short, date)
  )`,

  `CREATE TABLE clicks_per_country(
    short VARCHAR(8) NOT NULL,
    country VARCHAR(8) NOT NULL,
    clicks INTEGER DEFAULT 0,
    PRIMARY KEY(short, country)
  )`
]

async function CreateTables() {
  try {
    const client = new Client({
      user: process.env.POSTGRESQL_USER,
      host: process.env.POSTGRESQL_HOST,
      database: process.env.POSTGRESQL_DATABASE,
      password: process.env.POSTGRESQL_PASSWORD,
      port: Number(process.env.POSTGRESQL_PORT),
    });

    await client.connect();

    await Promise.all(
      commands.map(async (command) => {
        try {
          await client.query(command);
        } catch (err) {
          console.error(`Erro at execute command [${command}], ERRO: ${err}`)
          return
        }
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
      console.warn(`Database "${process.env.POSTGRESQL_DATABASE}" already exists.`);
    } else {
      console.error('Error creating database:', err.message);
    }
  } finally {
    await client.end();
  }

  await CreateTables()
}

criarBanco()