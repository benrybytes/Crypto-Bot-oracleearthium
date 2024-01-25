"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { query } = require("./db");
async function insertSelectedCoins(serverId, selectedCoins) {
    const sql = `
    INSERT INTO tracked_crypto (serverId, coinData)
    VALUES (?, ?);
  `;
    const params = [serverId, JSON.stringify(selectedCoins)];
    try {
        const result = await query(sql, params);
        return result;
    }
    catch (error) {
        console.error("Error inserting coins:", error);
        throw error;
    }
}
async function getSelectedCoins(serverId) {
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
    }
    catch (error) {
        console.error("Error retrieving coins:", error);
        throw error;
    }
}
async function checkAndAddServer(serverId) {
    const checkServerSQL = `
    SELECT COUNT(*) as count
    FROM tracked_crypto
    WHERE serverId = ?;
  `;
    try {
        const [result] = await query(checkServerSQL, [serverId]);
        console.log(result);
        if (result.count !== undefined && result.count === 0) {
            await insertServer(serverId);
            console.log(`Server with serverId ${serverId} added.`);
        }
        else if (Array.isArray(result) &&
            result[0] &&
            result[0].count !== undefined) {
            console.log(`Server with serverId ${serverId} already exists.`);
        }
        else {
            console.log(`Unexpected result structure.`);
        }
    }
    catch (error) {
        console.error("Error checking and adding server:", error);
        throw error;
    }
}
async function insertServer(serverId) {
    const insertServerSQL = `
    INSERT INTO tracked_crypto (serverId, coinData)
    VALUES (?, ?);
  `;
    try {
        const params = [serverId, JSON.stringify([])];
        const result = await query(insertServerSQL, params);
        console.log(result);
    }
    catch (error) {
        console.error("Error inserting server:", error);
        throw error;
    }
}
async function updateSelectedCoins(serverId, updatedCoins) {
    const sql = `
    UPDATE tracked_crypto
    SET coinData = ?
    WHERE serverId = ?;
  `;
    const params = [updatedCoins, serverId];
    try {
        const result = await query(sql, params);
        return result;
    }
    catch (error) {
        console.error("Error updating coins:", error);
        throw error;
    }
}
async function deleteSelectedCoins(serverId, coinId) {
    const sql = `
    DELETE FROM tracked_crypto
    WHERE serverId = ? AND id = ?;
  `;
    const params = [serverId, coinId];
    try {
        const result = await query(sql, params);
        return result;
    }
    catch (error) {
        console.error("Error deleting coin:", error);
        throw error;
    }
}
module.exports = {
    checkAndAddServer,
    insertSelectedCoins,
    getSelectedCoins,
    updateSelectedCoins,
    deleteSelectedCoins,
};
