import mysql from "mysql2/promise";

const config = {
  /* don't expose password or any sensitive info, done only for demo */
  db: {
    host: process.env.LOCAL_IPV4 || "127.0.0.1",
    user: process.env.USER || "root",
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: process.env.PORT || 15934,
    connectTimeout: 60000,
  },
  listPerPage: 10,
};

console.log(config);

async function query(sql: any, params: any) {
  const connection = await mysql.createConnection(config.db);
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
