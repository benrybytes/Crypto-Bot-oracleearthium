import IUserBetting from "../interfaces/user_betting.interface";
import { emptyOrRows } from "./db";

const { query } = require("./db");
async function getUsersBettingFromServerId(serverId: string) {
  const getUsersBetting = `
    SELECT usersBetting
    FROM bet_crypto
    WHERE serverId = ?;
`;

  const serverBetData = await query(getUsersBetting, [serverId]);

  return serverBetData;
}

const getUserByUid = async (serverId: string, uid: string) => {
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
    const result = await query(findUserByUid, [serverId, uid]);
    const userData = emptyOrRows(result)[0].userData;

    return userData ? userData : null;
  } catch (error) {
    console.error("Error in getUserByUid:", error);
    return null;
  }
};
const getUserBettingByUid = async (serverId: string, uid: string) => {
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

  const result = await query(findUserByUid, [serverId, uid]);
  const userBettingData = emptyOrRows(result);

  const userData = await getUserByUid(serverId, uid);

  return userBettingData[0].userBettingData === null
    ? { userBettingData, userData }
    : { data: undefined, userData: undefined };
};

async function getUsersFromServerId(serverId: string) {
  const getUsers = `
        SELECT users 
        FROM bet_crypto 
        WHERE serverId = ?;
`;
  return await query(getUsers, [serverId]);
}
async function addUserToBetting(
  serverId: string,
  uid: string,
  bet_amount: number,
  symbol: string,
  username: string,
  cryptoIncrease: boolean,
  current_price: number,
) {
  try {
    const checkServerSQL = `
      SELECT usersBetting
      FROM bet_crypto
      WHERE serverId = ?;
    `;

    // Check if the server exists
    const result: IUserBetting[] = await query(checkServerSQL, [serverId]);

    const parsedResult = emptyOrRows(result)[0].usersBetting;

    if (result && result[0]) {
      // Server exists, update the usersBetting array

      const usersBetting: IUserBetting[] = parsedResult || [];
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

      await query(updateUsersBettingSQL, [usersBetting, serverId]);
      return result;
    } else {
      // Server does not exist
      console.error(`Server with serverId ${serverId} does not exist.`);
    }
  } catch (error) {
    console.error("Error adding user to betting:", error);
    throw error;
  }
}

module.exports = {
  addUserToBetting,
  getUsersFromServerId,
  getUsersBettingFromServerId,
  getUserBettingByUid,
};
