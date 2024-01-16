import mysql from "mysql2/promise";

const config = {
  /* don't expose password or any sensitive info, done only for demo */
  db: {
    host: process.env.LOCAL_IPV4 || "127.0.0.1",
    user: "root" || process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: 3306,
    connectTimeout: 60000,
  },
  listPerPage: 10,
};

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

function getOffset(currentPage: any = 1, listPerPage: any) {
  return (currentPage - 1) * listPerPage;
}

function emptyOrRows(rows: any) {
  if (!rows) {
    return [];
  }
  return rows;
}

export { config, emptyOrRows, getOffset, query, createTable };
