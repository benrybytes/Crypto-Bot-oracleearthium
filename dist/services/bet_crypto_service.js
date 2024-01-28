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
const db_1 = require("./db");
const { query } = require("./db");
function getUsersBettingFromServerId(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getUsersBetting = `
    SELECT usersBetting
    FROM bet_crypto
    WHERE serverId = ?;
`;
        const result = yield query(getUsersBetting, [serverId]);
        const resolve = (0, db_1.emptyOrRows)(result)[0].usersBetting;
        return resolve;
    });
}
const getUserByUid = (serverId, uid) => __awaiter(void 0, void 0, void 0, function* () {
    const findUserByUid = `
    SELECT json_extract(users, '$[0]') AS user
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(users, ?);
  `;
    try {
        const result = yield query(findUserByUid, [serverId, JSON.stringify({ "uid": uid })]);
        const user_data = (0, db_1.emptyOrRows)(result)[0].user; // Get actual data
        return user_data ? user_data : null;
    }
    catch (error) {
        console.error("Error in getUserByUid:", error);
        return null;
    }
});
const getUserBettingByUid = (serverId, uid) => __awaiter(void 0, void 0, void 0, function* () {
    const findUserByUid = `
    SELECT json_extract(usersBetting, '$[0]') AS user_betting
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(usersBetting, ?);
  `;
    // Add single quotes to the selector for uid to use insertion easier as JSON_CONTAINS uses stringified json text for second argument
    const result = yield query(findUserByUid, [serverId, JSON.stringify({ "uid": uid })]);
    const user_betting_rows = (0, db_1.emptyOrRows)(result);
    const user_data = yield getUserByUid(serverId, uid);
    console.log("here is user_data", user_data);
    // Check whether there is a user betting and send user regardless
    return user_betting_rows.length !== 0
        ? { user_betting: user_betting_rows[0].user_betting, user: user_data }
        : { user_betting: null, user: user_data };
});
function getUsersFromServerId(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getUsers = `
        SELECT users 
        FROM bet_crypto 
        WHERE serverId = ?;
`;
        return yield query(getUsers, [serverId]);
    });
}
function addUserToBetting(serverId, uid, bet_amount, symbol, username, cryptoIncrease, current_price) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const checkServerSQL = `
      SELECT usersBetting
      FROM bet_crypto
      WHERE serverId = ?;
    `;
            // Check if the server exists
            const result = yield query(checkServerSQL, [serverId]);
            const parsedResult = (0, db_1.emptyOrRows)(result)[0].usersBetting;
            if (result && result[0]) {
                // Server exists, update the usersBetting array
                const usersBetting = parsedResult || [];
                usersBetting.push({
                    uid,
                    bet_amount,
                    symbol,
                    cryptoIncrease,
                    username,
                    current_price,
                });
                const updateUsersBettingSQL = `
        UPDATE bet_crypto
        SET usersBetting = ?
        WHERE serverId = ?;
      `;
                yield query(updateUsersBettingSQL, [usersBetting, serverId]);
                const betSQL = `
        UPDATE bet_crypto
        SET users = (
          SELECT JSON_ARRAYAGG(
            CASE
              WHEN JSON_UNQUOTE(JSON_EXTRACT(user, '$.uid')) = ? THEN
                JSON_SET(
                  user,
                  '$.points',
                  JSON_UNQUOTE(JSON_EXTRACT(user, '$.points')) - ?
                )
              ELSE
                user
            END
          )
          FROM JSON_TABLE(users, '$[*]' COLUMNS (
            user JSON PATH '$'
          )) AS t
        )
        WHERE serverId = ?;
      `;
                yield query(betSQL, [uid, bet_amount, serverId]);
                return usersBetting;
            }
            else {
                // Server does not exist
                console.error(`Server with serverId ${serverId} does not exist.`);
            }
        }
        catch (error) {
            console.error("Error adding user to betting:", error);
            throw error;
        }
    });
}
exports.default = {
    addUserToBetting,
    getUsersFromServerId,
    getUsersBettingFromServerId,
    getUserBettingByUid,
};
