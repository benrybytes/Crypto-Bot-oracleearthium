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
        const serverBetData = yield query(getUsersBetting, [serverId]);
        return serverBetData;
    });
}
const getUserByUid = (serverId, uid) => __awaiter(void 0, void 0, void 0, function* () {
    const findUserByUid = `
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'uid', users.uid,
        'username', users.username,
        'points', users.points
      )
    ) AS userData
    FROM bet_crypto,
    JSON_TABLE(
      bet_crypto.users,
      '$[*]' COLUMNS (
        uid VARCHAR(255) PATH '$.uid',
        username VARCHAR(255) PATH '$.username',
        points INT PATH '$.points'
      )
    ) AS users
    WHERE bet_crypto.serverId = ? AND users.uid = ?;
  `;
    try {
        const result = yield query(findUserByUid, [serverId, uid]);
        const userData = (0, db_1.emptyOrRows)(result)[0].userData;
        return userData ? userData : null;
    }
    catch (error) {
        console.error("Error in getUserByUid:", error);
        return null;
    }
});
const getUserBettingByUid = (serverId, uid) => __awaiter(void 0, void 0, void 0, function* () {
    const findUserByUid = `
    

SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
        'uid', JSON_EXTRACT(ub.usersBetting, '$.uid'),
        'bet_amount', JSON_EXTRACT(ub.usersBetting, '$.bet_amount'),
        'symbol', JSON_EXTRACT(ub.usersBetting, '$.symbol'),
        'cryptoIncrease', JSON_EXTRACT(ub.usersBetting, '$.cryptoIncrease'),
        'username', JSON_EXTRACT(ub.usersBetting, '$.username'),
        'current_price', JSON_EXTRACT(ub.usersBetting, '$.current_price')
    )
) AS userBettingData
FROM (
    SELECT JSON_ARRAYAGG(usersBetting) AS usersBetting
    FROM bet_crypto
    WHERE serverId = ?
) AS ub
WHERE JSON_EXTRACT(ub.usersBetting, '$.uid') = ?;


  `;
    const result = yield query(findUserByUid, [serverId, uid]);
    const userBettingData = (0, db_1.emptyOrRows)(result);
    const userData = yield getUserByUid(serverId, uid);
    return userBettingData[0].userBettingData === null
        ? { userBettingData, userData }
        : { data: undefined, userData: undefined };
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
                return result;
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
