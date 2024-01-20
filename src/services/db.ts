import mysql, { Connection, ConnectionOptions } from "mysql2/promise";
import { config } from "../config";
import { dbconfig } from "../dbconfig.development";

let configuration = {
  /* don't expose password or any sensitive info, done only for demo */
  db: {
    host: process.env.LOCAL_IPV4,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: 15934,
    connectTimeout: 60000,
    /*  ssl: {
      // Set SSL mode to REQUIRED
      mode: "REQUIRED",
      // Optionally provide the CA certificate
      ca: process.env.CERT,
    }, */
  },
  listPerPage: 10,
};

configuration = {
  /* don't expose password or any sensitive info, done only for demo */
  db: {
    host: "127.0.0.1",
    user: "root",
    password: "bread",
    database: "your_database_name",
    port: 3306,
    connectTimeout: 60000,
    /*  ssl: {
      // Set SSL mode to REQUIRED
      mode: "REQUIRED",
      // Optionally provide the CA certificate
      ca: process.env.CERT,
    }, */
  },
  listPerPage: 10,
};

const configConnection: ConnectionOptions = {
  host: process.env.LOCAL_IPV4 || "127.0.0.1",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "",
  database: process.env.DB || "",
  port: 15934,
  connectTimeout: 60000,
};

async function query(sql: any, params: any) {
  const connection: Connection = await mysql.createConnection(dbconfig);
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

export {
  config,
  emptyOrRows,
  getOffset,
  query,
  createTable,
  createDiscordDataTable,
};
