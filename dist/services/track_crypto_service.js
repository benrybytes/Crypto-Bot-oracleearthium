"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { query } = require("./db");
// Insert new server with selected coins into the database
function insertSelectedCoins(serverId, selectedCoins) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    INSERT INTO tracked_crypto (serverId, coinData)
    VALUES (?, ?);
  `;
        const params = [serverId, JSON.stringify(selectedCoins)];
        try {
            const result = yield query(sql, params);
            return result;
        }
        catch (error) {
            console.error("Error inserting coins:", error);
            throw error;
        }
    });
}
// Retrieve selected coins from the database
function getSelectedCoins(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    SELECT id, serverId, coinData
    FROM tracked_crypto
    WHERE serverId = ?;
  `;
        const params = [serverId];
        try {
            const result = yield query(sql, params);
            console.log("result: ", result);
            return result;
        }
        catch (error) {
            console.error("Error retrieving coins:", error);
            throw error;
        }
    });
}
function checkAndAddDiscordServer(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkServerSQL = `
    SELECT COUNT(*) as count
    FROM tracked_crypto
    WHERE serverId = ?;
  `;
        try {
            const [result] = yield query(checkServerSQL, [serverId]);
            console.log(result);
            if (result.count !== undefined && result.count === 0) {
                // Server not present, add it
                yield insertDiscordServer(serverId);
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
    });
}
// Insert server into the table
function insertDiscordServer(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        const insertServerSQL = `
    INSERT INTO tracked_crypto (serverId, coinData)
    VALUES (?, ?);
  `;
        try {
            // You can initialize data as needed
            const params = [serverId, JSON.stringify([])];
            yield query(insertServerSQL, params);
        }
        catch (error) {
            console.error("Error inserting server:", error);
            throw error;
        }
    });
}
// Update selected coins in the database
function updateSelectedCoins(serverId, updatedCoins) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    UPDATE tracked_crypto
    SET coinData = ?
    WHERE serverId = ?;
  `;
        const params = [updatedCoins, serverId];
        try {
            const result = yield query(sql, params);
            return result;
        }
        catch (error) {
            console.error("Error updating coins:", error);
            throw error;
        }
    });
}
// Delete selected coins from the database
function deleteSelectedCoins(serverId, coinId) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    DELETE FROM tracked_crypto
    WHERE serverId = ? AND id = ?;
  `;
        const params = [serverId, coinId];
        try {
            const result = yield query(sql, params);
            return result;
        }
        catch (error) {
            console.error("Error deleting coin:", error);
            throw error;
        }
    });
}
module.exports = {
    checkAndAddDiscordServer,
    insertSelectedCoins,
    getSelectedCoins,
    updateSelectedCoins,
    deleteSelectedCoins,
};
