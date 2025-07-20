require('dotenv').config();
const { Pool } = require("pg");

console.log("Conectando ao banco em:", process.env.DB_HOST);

// Conexão com parâmetros individuais, incluindo SSL obrigatório para Render
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // necessário para Render.com
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
