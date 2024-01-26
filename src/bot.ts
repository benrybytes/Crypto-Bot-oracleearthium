import {
  Client,
  Guild,
  GuildManager,
  Interaction,
  GatewayIntentBits,
  User,
  GuildMemberManager,
  GuildMember,
  Collection,
} from "discord.js";
import { registerCommands } from "./registerCommands";
import commandList from "./commands/commandList"; // Import the commands directly
import createApp from "./webpage/index";
import Users from "./handlers/users";
import {
  createDiscordDataTable,
  createTable,
  emptyOrRows,
  query,
} from "./services/db";
import IUser from "./interfaces/users.interface";
import IUserBetting from "./interfaces/user_betting.interface";
import makeFetchRequest from "./helpers/fetchHandler";
import path from "path";
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "/config/discord_config"))[env];
const token = config.discord_token;
// bot created for server with permissions
const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});
const users = Users.getInstance();

// Servers bot has access to
let guilds: GuildManager;
let usersForEachServer: User[][]; // Members of different servers in their respective servers made of users
// When bot is ready, make global commands |
client.once("ready", async () => {
  await createTable();
  await createDiscordDataTable();
  console.log("Discord bot is ready! 🤖");

  // Get the servers saved in the cache of the discord bot
  guilds = client.guilds;
  users.setServers(guilds);
  usersForEachServer = await Promise.all(
    Users.getServers().map(
      async (server: Guild) => await users.fetchMembers(server),
    ),
  );

  const handleUsersNewInput = async (serverId: string, server: Guild) => {
    // Check if the server exists in the database
    const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;

    const result = await query(checkServerSQL, [serverId]);

    // If an array, we know we could move on to compare its elements
    if (Array.isArray(result) && result.length === 0) {
      // Server not present, add it
      const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
      VALUES (?, ?, '[]');
    `;

      const findUsersInServer: Guild = Users.getServers().find(
        (e) => e.id == serverId,
      )!;

      const discordServerUsers:
        | GuildMemberManager
        | Collection<string, GuildMember> =
        await findUsersInServer.members.fetch();

      // Set users data for all servers bot is connected to if no table is found
      const usersInDiscordServerData: IUser[] = discordServerUsers
        .map((member: GuildMember) => {
          if (member.id === client.user?.id) return;
          return {
            uid: member.id,
            username: member.user.username,
            points: 0,
          };
        })
        .filter((user: IUser | undefined): user is IUser => user !== undefined);

      // Convert serverUsers to a JSON string before inserting
      const usersJson = JSON.stringify(usersInDiscordServerData);

      await query(addServerSQL, [serverId, usersJson]);
      console.log(`Server with serverId ${serverId} added.`);
    }
  };
  Users.getServers().map((server: Guild) => {
    handleUsersNewInput(server.id, server);
  });
  await registerCommands({ guildId: "", commands: commandList });
});
client.on("guildMemberRemove", async (member) => {
  const serverId = member.guild.id;
  const memberId = member.id;

  // Delete the specific user from the users array in bet_crypto table
  const removeBetCryptoUserSQL = `
    UPDATE bet_crypto
    SET users = ?
    WHERE serverId = ? 
  `;

  const getUsersSQL = `
    SELECT users
  FROM bet_crypto
  WHERE serverId = ?;
  `;

  const usersResult = emptyOrRows(await query(getUsersSQL, [serverId]));

  const usersJson: IUser[] = usersResult[0].users.filter(
    (user: IUser) => user.uid !== memberId,
  );

  const result = emptyOrRows(
    await query(removeBetCryptoUserSQL, [usersJson, serverId]),
  );

  console.log("DELTED USER: ", result);
});

client.on("guildMemberAdd", async (member) => {
  const serverId = member.guild.id;
  console.log(`New member joined server with ID: ${serverId}`);

  const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;

  const result = await query(checkServerSQL, [serverId]);

  console.log("RESULT: ", result);

  if (Array.isArray(result) && result.length > 0) {
    // Server present, add the new member to the users array
    const addUserSQL = `
      UPDATE bet_crypto
SET users = JSON_MERGE_PRESERVE(COALESCE(users, '[]'), CAST(? AS JSON))
WHERE serverId = ?;

    `;

    const newUser: IUser = {
      uid: member.id,
      username: member.user.username,

      points: 0,
    };

    const addUserSQLResult = await query(addUserSQL, [
      JSON.stringify(newUser),
      serverId,
    ]);
    console.log(addUserSQLResult);
    console.log(`User with UID ${member.id} added to server ${serverId}.`);
  } else {
    // Server not present, add it with the new member
    const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
VALUES (?, CAST('[{"uid": ?, "username": ?, "points": 0}]' AS JSON), '[]');

    `;

    await query(addServerSQL, [serverId]);
    console.log(`Server with serverId ${serverId} added with the new member.`);
  }
  // Your existing code...
});
client.on("guildCreate", async (guild) => {
  const serverId = guild.id;

  const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;

  const result = await query(checkServerSQL, [serverId]);

  if (!Array.isArray(result) || result.length === 0) {
    // Server not present, add it with empty users and usersBetting arrays
    const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
      VALUES (?, '[]', '[]');
    `;

    await query(addServerSQL, [serverId]);
    console.log(`Server with serverId ${serverId} added.`);
  } else {
    console.log(`Server with serverId ${serverId} already exists.`);
  }
});
// Any interaction created | Command
client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const command = commandList.find(
    (cmd) => cmd.data.name === interaction.commandName,
  );
  if (command) {
    command.execute(interaction);
  }
});

console.log("Bot registration process...");
client.login(token);

let lastExecutionTime: Date;

setInterval(
  function () {
    const now = new Date();

    // Check if 24 hours have passed since the last execution

    if (
      !lastExecutionTime ||
      now.getTime() - lastExecutionTime.getTime() >= 12 * 60 * 60 * 1000
    ) {
      lastExecutionTime = now;

      resetLeaderboardAndGivePoints();
    }
  },
  12 * 60 * 60 * 1000,
); // 12 hours interval

const resetLeaderboardAndGivePoints = async () => {
  async function processUserBetting(userBet: IUserBetting, serverId: string) {
    const { uid, symbol, bet_amount, cryptoIncrease, current_price } = userBet;

    const getUsersSQL = `
  SELECT users 
  FROM bet_crypto 
  WHERE serverId = ?;
`;
    const [recentPriceFound, _error] = await makeFetchRequest<any>(
      "https://api.coincap.io/v2/assets?search=" + symbol,
    );

    const trackedCryptoData: string = await recentPriceFound!.then(
      (res: any) => res.data[0].priceUsd,
    );

    const userQuery = await emptyOrRows(await query(getUsersSQL, [serverId]));
    const usersArray = userQuery[0].users;

    // Find the user in the array and update points
    const userIndex = usersArray.findIndex((user: IUser) => user.uid === uid);
    if (userIndex !== -1) {
      if (parseFloat(trackedCryptoData) > current_price && cryptoIncrease) {
        usersArray[userIndex].points += bet_amount * 2;
      } else {
        usersArray[userIndex].points -= bet_amount;
      }
    }

    // Convert the array back to a JSON string
    const updatedUsersJSON = usersArray;

    // Update the users column in the database
    const updatePointsSQL = `
  UPDATE bet_crypto
  SET users = ?
  WHERE serverId = ?`;

    // Execute the query with the necessary parameters
    await query(updatePointsSQL, [updatedUsersJSON, serverId]);
  }
  async function getAllUserBetting(serverId: string) {
    const getAllUserBettingSQL = `
      SELECT usersBetting
      FROM bet_crypto
      WHERE serverId = ?;
    `;
    const result = await query(getAllUserBettingSQL, [serverId]);
    const row = emptyOrRows(result);

    if (row) {
      const userBettingArray: IUserBetting[] = row[0].usersBetting;
      console.log("users betting: ", userBettingArray);
      if (userBettingArray && userBettingArray.length > 0) {
        for (const userBet of userBettingArray) {
          // Assuming userBet has the necessary properties

          await processUserBetting(userBet, serverId);
        }
      } else {
        console.log(`No userBetting found for serverId ${serverId}.`);
      }
    } else {
      console.log(`No data found for serverId ${serverId}.`);
    }
  }

  async function addPointsToUsers(serverId: string, pointIncrement: number) {
    const addPointsToUsersSQL = `
    UPDATE bet_crypto
SET users = (
    SELECT JSON_ARRAYAGG(
        JSON_SET(
            user,
            '$.points',
            JSON_UNQUOTE(JSON_EXTRACT(user, '$.points')) + ?
        )
    )
    FROM JSON_TABLE(users, '$[*]' COLUMNS (
        user JSON PATH '$'
    )) AS t
)
WHERE serverId = ?;
`;
    const result = await query(addPointsToUsersSQL, [pointIncrement, serverId]);
    const row = emptyOrRows(result);
  }

  Users.getServers().map((server: Guild) => getAllUserBetting(server.id));
  Users.getServers().map((server: Guild) => addPointsToUsers(server.id, 50));

  // Reset all users that are betting after calculating which one's got it correct
  const resetUsersBettingSQL = `
    UPDATE bet_crypto
    SET usersBetting = '[]';
  `;

  await query(resetUsersBettingSQL, []);
};
