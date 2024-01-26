import mysql, { Connection, ConnectionOptions } from "mysql2/promise";
import path from "path";
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../config/db_config"))[env];

const dbUsername = config.username;
const dbPassword = config.password;
const dbHost = config.host;
const dbDatabaseName = config.database;
const port = parseInt(config.port!) || 15934;

if (!dbUsername || !dbPassword || !dbHost) {
  throw new Error("DB_USERNAME environment variables must be set");
}

async function query(sql: any, params: any) {
  const connection: Connection = mysql.createPool({
    host: dbHost,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabaseName,
    port: port,
    connectTimeout: 60000,
    connectionLimit: 10, // How many applications could interact with our application db
  });
  const [results] = await connection.execute(sql, params);

  return results;
}

async function createTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tracked_crypto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serverId VARCHAR(255),
  coinData JSON
);  `;

  await query(createTableSQL, []);
}

async function createDiscordDataTable() {
  const createTableSQL = `
   

CREATE TABLE IF NOT EXISTS bet_crypto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serverId VARCHAR(255),
  day TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  users JSON,
  usersBetting JSON,
  INDEX (serverId)

);  `;

  try {
    await query(createTableSQL, []);
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
}

function getOffset(currentPage: any = 1, listPerPage: any) {
  return (currentPage - 1) * listPerPage;
}

function emptyOrRows(rows: any) {
  if (!rows) {
    return [];
  }
  return rows;
}

export { emptyOrRows, getOffset, query, createTable, createDiscordDataTable };
