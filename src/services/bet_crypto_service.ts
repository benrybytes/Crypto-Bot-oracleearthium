import IUserBetting from "../interfaces/user_betting.interface";
import { emptyOrRows } from "./db";

const { query } = require("./db");
async function getUsersBettingFromServerId(serverId: string) {
  const getUsersBetting = `
    SELECT usersBetting
    FROM bet_crypto
    WHERE serverId = ?;
`;

  const result = await query(getUsersBetting, [serverId]);
  const resolve = emptyOrRows(result)[0].usersBetting;

  return resolve;
}

const getUserByUid = async (serverId: string, uid: string) => {
  const findUserByUid = `
    SELECT json_extract(users, '$[0]') AS user
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(users, ?);
  `;

  try {
    const result = await query(findUserByUid, [serverId, JSON.stringify({ "uid": uid })]);
    const user_data = emptyOrRows(result)[0].user; // Get actual data

    return user_data ? user_data : null;
  } catch (error) {
    console.error("Error in getUserByUid:", error);
    return null;
  }
};
const getUserBettingByUid = async (serverId: string, uid: string) => {
  const findUserByUid = `
    SELECT json_extract(usersBetting, '$[0]') AS user_betting
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(usersBetting, ?);
  `;
  // Add single quotes to the selector for uid to use insertion easier as JSON_CONTAINS uses stringified json text for second argument
  const result = await query(findUserByUid, [serverId, JSON.stringify({ "uid": uid })]);

  const user_betting_rows = emptyOrRows(result);
  const user_data = await getUserByUid(serverId, uid);

  console.log("here is user_data", user_data)

  // Check whether there is a user betting and send user regardless
  return user_betting_rows.length !== 0
    ? { user_betting: user_betting_rows[0].user_betting, user: user_data }
    : { user_betting: null, user: user_data };
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

      await query(betSQL, [uid, bet_amount, serverId]);

      return usersBetting;
    } else {
      // Server does not exist
      console.error(`Server with serverId ${serverId} does not exist.`);
    }
  } catch (error) {
    console.error("Error adding user to betting:", error);
    throw error;
  }
}

export default {
  addUserToBetting,
  getUsersFromServerId,
  getUsersBettingFromServerId,
  getUserBettingByUid,
};
