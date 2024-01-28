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
import { IGuildWithUsers } from "./interfaces/server.interface";
import makeFetchRequest from "./helpers/fetchHandler";
import path from "path";
import add_points_to_users from "./mysql/add_points_to_users";
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

// Reset all users that are betting after calculating which one's got it correct
const resetUsersBettingSQL = `
  UPDATE bet_crypto
  SET usersBetting = '[]';
`;
const getAllUserBettingSQL = `
  SELECT usersBetting
  FROM bet_crypto
  WHERE serverId = ?;
`;
const getUsersSQL = `
  SELECT users 
  FROM bet_crypto 
  WHERE serverId = ?;
`;

const updateUsersInBetCrypto = `
  UPDATE bet_crypto
  SET users = ?
  WHERE serverId = ? 
`;


const addServerSQL = `
  INSERT INTO bet_crypto (serverId, users, usersBetting)
  VALUES (?, ?, '[]');
`;

const checkServerSQL = `
  SELECT *
  FROM bet_crypto
  WHERE serverId = ?;
`;



// Servers bot has access to
let guilds: GuildManager;


client.once("ready", async () => {
  Users.setClient(client);
  await createTable();
  await createDiscordDataTable();

  console.log("Discord bot is ready! 🤖");

  // Get the servers saved in the cache of the discord bot
  guilds = client.guilds;

  // Resolve the database data into an array of objects
  const guildWithUsersPromises: Promise<{ guild: Guild; users: IUser[]; }>[] = guilds.cache.map(async (value: Guild) => {
    const usersFromDB: IUser[] = emptyOrRows(query(getUsersSQL, [value.id]));
    return {
      guild: value,
      users: usersFromDB,
    };
  });

  // Wait for all asynchronouse data to be resolved 
  const guildWithUsers: IGuildWithUsers[] = await Promise.all(guildWithUsersPromises);

  // Now be safely added to server data
  Users.setDataInServerData(guildWithUsers);

  Users.getServers().map((server: IGuildWithUsers) => {
    addCurrentUsersInDB(server.guild.id, server.guild);
  });
  await registerCommands({ guildId: "", commands: commandList });
});
client.on("guildMemberRemove", async (member) => {
  const serverId = member.guild.id;

  const user: IUser = {
    points: 0,
    uid: member.id,
    username: member.user.username,
  }

  // Delete the specific user from the users array in bet_crypto table
  removeUserInUsersInDB(serverId, user)
});

client.on("guildMemberAdd", async (member) => {
  const guild: Guild = await client.guilds.fetch(member.guild.id).then((res: Guild) => res);


  const user: IUser = {
    points: 0,
    uid: member.id,
    username: member.user.username,
  }
  addUserInUsersInDB(guild.id, user)
});
client.on("guildCreate", async (guild) => {
  const serverId = guild.id;

  // Stored in servers.json if bot rejoins server
  const foundServer: number = Users.getServerIndex(serverId);

  // New server found for the bot
  if (foundServer == -1) {
    Users.addNewServer(guild);
    addCurrentUsersInDB(serverId, guild);
    return;
  }

  // Previous server found for the bot
  addPreviousWithCurrentUsersInDB(serverId, guild, Users.getUsersAtServerId(serverId));;


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
createApp(users);
client.login(token);

let lastExecutionTime: Date;

setInterval(
  function() {
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

    Users.setUsersInServerId(serverId, usersArray);

    // Execute the query with the necessary parameters
    await query(updateUsersInBetCrypto, [usersArray, serverId]);
  }
  async function getAllUserBetting(serverId: string) {

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
    const result = await query(add_points_to_users, [pointIncrement, serverId]);
    emptyOrRows(result);
  }

  Users.getServers().map((server: IGuildWithUsers) => getAllUserBetting(server.guild.id));
  Users.getServers().map((server: IGuildWithUsers) => addPointsToUsers(server.guild.id, 50));

  await query(resetUsersBettingSQL, []);
};

const addPreviousWithCurrentUsersInDB = async (serverId: string, guild: Guild, previousUsers: IUser[]) => {

  // Current members
  const discordServerUsers:
    | GuildMemberManager
    | Collection<string, GuildMember> =
    await guild.members.fetch();

  // Previous members stored

  const newCurrentUsers = discordServerUsers.filter((member: GuildMember) => previousUsers.find((user: IUser) => user.uid === member.id) == undefined);

  // Create the new users
  const createUsers = newCurrentUsers.map((member: GuildMember) => {
    return {
      uid: member.id,
      username: member.user.username,
      points: 0,
    };
  });

  const addToPreviousMembers = previousUsers.concat(createUsers);

  await emptyOrRows(await query(updateUsersInBetCrypto, [addToPreviousMembers, serverId]))
}

const addCurrentUsersInDB = async (serverId: string, server: Guild) => {
  const result = await query(checkServerSQL, [serverId]);

  // If an array, we know we could move on to compare its elements
  if (Array.isArray(result) && result.length === 0) {
    addServerMembersToSQL(server)
  }
};

const removeUserInUsersInDB = async (serverId: string, user: IUser) => {

  const usersResult = emptyOrRows(await query(getUsersSQL, [serverId]));

  const usersJson: IUser[] = usersResult[0].users.filter(
    (user_found: IUser) => user_found.uid !== user.uid,
  );

  Users.setUsersInServerId(serverId, usersJson);


  emptyOrRows(
    await query(updateUsersInBetCrypto, [usersJson, serverId]),
  );


}

// Add one user to the users field in database
const addUserInUsersInDB = async (serverId: string, user: IUser) => {
  const user_result: IUser[] = emptyOrRows(await query(getUsersSQL, [serverId]));

  user_result.push(user);

  Users.setUsersInServerId(serverId, user_result);

  await emptyOrRows(await query(updateUsersInBetCrypto, [user_result, serverId]));

}

// Add to new servers only, and not to the ones that already exist
const addServerMembersToSQL = async (guild: Guild) => {
  // Server not present, add it

  const discordServerUsers:
    | GuildMemberManager
    | Collection<string, GuildMember> =
    await guild.members.fetch();

  // Create new user list containing data for newly added users 
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

  await query(addServerSQL, [guild.id, usersInDiscordServerData]);
  console.log(`Server with serverId ${guild.id} added.`);
}


