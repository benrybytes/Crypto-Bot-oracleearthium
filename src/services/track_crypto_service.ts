import { CryptoCurrency } from "../interfaces/cryptoresponse.interface.";
const { query } = require("./db");

// Insert new server with selected coins into the database
async function insertSelectedCoins(
  serverId: string,
  selectedCoins: CryptoCurrency[],
) {
  const sql = `
    INSERT INTO tracked_crypto (serverId, coinData)
    VALUES (?, ?);
  `;
  const params = [serverId, JSON.stringify(selectedCoins)];

  try {
    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error("Error inserting coins:", error);
    throw error;
  }
}

// Retrieve selected coins from the database
async function getSelectedCoins(serverId: string) {
  const sql = `
    SELECT id, serverId, coinData
    FROM tracked_crypto
    WHERE serverId = ?;
  `;
  const params = [serverId];

  try {
    const result = await query(sql, params);
    console.log("result: ", result);
    return result;
  } catch (error) {
    console.error("Error retrieving coins:", error);
    throw error;
  }
}

async function checkAndAddDiscordServer(serverId: string) {
  const checkServerSQL = `
    SELECT COUNT(*) as count
    FROM tracked_crypto
    WHERE serverId = ?;
  `;

  try {
    const [result] = await query(checkServerSQL, [serverId]);
    console.log(result);

    if (result.count !== undefined && result.count === 0) {
      // Server not present, add it
      await insertDiscordServer(serverId);
      console.log(`Server with serverId ${serverId} added.`);
    } else if (
      Array.isArray(result) &&
      result[0] &&
      result[0].count !== undefined
    ) {
      console.log(`Server with serverId ${serverId} already exists.`);
    } else {
      console.log(`Unexpected result structure.`);
    }
  } catch (error) {
    console.error("Error checking and adding server:", error);
    throw error;
  }
}

// Insert server into the table
async function insertDiscordServer(serverId: string) {
  const insertServerSQL = `
    INSERT INTO tracked_crypto (serverId, coinData)
    VALUES (?, ?);
  `;

  try {
    // You can initialize data as needed
    const params = [serverId, JSON.stringify([])];
    const result = await query(insertServerSQL, params);
    console.log(result);
  } catch (error) {
    console.error("Error inserting server:", error);
    throw error;
  }
}

// Update selected coins in the database
async function updateSelectedCoins(
  serverId: string,
  updatedCoins: CryptoCurrency[],
) {
  const sql = `
    UPDATE tracked_crypto
    SET coinData = ?
    WHERE serverId = ?;
  `;
  const params = [updatedCoins, serverId];

  try {
    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error("Error updating coins:", error);
    throw error;
  }
}

// Delete selected coins from the database
async function deleteSelectedCoins(serverId: string, coinId: string) {
  const sql = `
    DELETE FROM tracked_crypto
    WHERE serverId = ? AND id = ?;
  `;
  const params = [serverId, coinId];

  try {
    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error("Error deleting coin:", error);
    throw error;
  }
}

module.exports = {
  checkAndAddDiscordServer,
  insertSelectedCoins,
  getSelectedCoins,
  updateSelectedCoins,
  deleteSelectedCoins,
};
