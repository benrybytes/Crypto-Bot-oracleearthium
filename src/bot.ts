import {
  Client,
  Collection,
  Guild,
  GuildManager,
  Interaction,
  OAuth2Guild,
  GatewayIntentBits,
  PermissionsBitField,
  GuildMemberManager,
  GuildMember,
  User,
  UserManager,
} from "discord.js";
import { registerCommands } from "./registerCommands";
import commandList from "./commands/commandList"; // Import the commands directly
import createApp from "./webpage/index";
import Users from "./handlers/users";
import { createDiscordDataTable, query } from "./services/db";
const token = process.env.DISCORD_TOKEN;

// bot created for server with permissions
const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// Servers bot has access to
let guilds: GuildManager;
let usersForEachServer: User[][]; // Members of different servers in their respective servers made of users

const users = new Users();

// When bot is ready, make global commands |
client.once("ready", async () => {
  await createDiscordDataTable();
  await createDiscordDataTable();
  console.log("Discord bot is ready! 🤖");

  // Get the servers saved in the cache of the discord bot
  guilds = client.guilds;
  users.setServers(guilds);
  usersForEachServer = await Promise.all(
    users
      .getServers()
      .map(async (server: Guild) => await users.fetchMembers(server)),
  );

  const handleUsersNewInput = async (
    serverId: string,
    serverUsers: User[][],
  ) => {
    // Check if the server exists in the database
    const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;

    const result = await query(checkServerSQL, [serverId]);
    console.log(result);

    // If an array, we know we could move on to compare its elements
    if (Array.isArray(result) && result.length === 0) {
      // Server not present, add it
      const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
      VALUES (?, ?, '[]');
    `;

      // Convert serverUsers to a JSON string before inserting
      const usersJson = JSON.stringify(
        serverUsers.map((users) => users.map((user) => ({ uid: user.id }))),
      );

      await query(addServerSQL, [serverId, usersJson]);
      console.log(`Server with serverId ${serverId} added.`);
    }
  };

  console.log(usersForEachServer);

  console.log(users.getServers());
  users.getServers().map((server: Guild) => {
    handleUsersNewInput(server.id, usersForEachServer);
  });
  await registerCommands({ guildId: "", commands: commandList });
});
client.on("guildMemberAdd", async (member) => {
  const serverId = member.guild.id;

  const checkMembersSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(users, ?);
  `;

  const userResult = await query(checkMembersSQL, [
    serverId,
    JSON.stringify({ uid: member.id }),
  ]);

  if (!userResult) {
    // User not present, add them
    const addUserSQL = `
      UPDATE bet_crypto
      SET users = JSON_ARRAY_APPEND(users, '$', ?)
      WHERE serverId = ?;
    `;

    const newUser = {
      uid: member.id,
      bettingAmount: 0,
      symbol: "",
    };

    await query(addUserSQL, [JSON.stringify(newUser), serverId]);
    console.log(`User with UID ${member.id} added to server ${serverId}.`);
  }

  users.getServers().map((guild: Guild) => {
    const serverId = guild.id;
  });
  await registerCommands({ guildId: "", commands: commandList });
});
client.on("guildMemberAdd", async (member) => {
  const serverId = member.guild.id;

  const checkMembersSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(users, ?);
  `;

  const userResult = await query(checkMembersSQL, [
    serverId,
    JSON.stringify({ uid: member.id }),
  ]);

  if (!userResult) {
    // User not present, add them
    const addUserSQL = `
      UPDATE bet_crypto
      SET users = JSON_ARRAY_APPEND(users, '$', ?)
      WHERE serverId = ?;
    `;

    const newUser = {
      uid: member.id,
      bettingAmount: 0,
      symbol: "",
    };

    await query(addUserSQL, [JSON.stringify(newUser), serverId]);
    console.log(`User with UID ${member.id} added to server ${serverId}.`);
  }
});

client.on("guildCreate", async (guild) => {
  const serverId = guild.id;
  console.log(serverId);
  const checkMembersSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ? AND JSON_CONTAINS(users, ?);
  `;

  usersForEachServer.map((serverUsers: User[]) =>
    serverUsers.forEach(async (member: User) => {
      const userResult = await query(checkMembersSQL, [
        serverId,
        JSON.stringify({ uid: member.id }),
      ]);

      if (!userResult) {
        // User not present, add them
        const addUserSQL = `
          UPDATE bet_crypto
          SET users = JSON_ARRAY_APPEND(COALESCE(users, '[]'), '$', ?)
          WHERE serverId = ?;
        `;

        const newUser = {
          uid: member.id,
          bettingAmount: 0,
          symbol: "",
        };

        await query(addUserSQL, [JSON.stringify(newUser), serverId]);
        console.log(`User with UID ${member.id} added to server ${serverId}.`);
      }
    }),
  );
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

const app = createApp(users);

console.log("Bot registration process...");
client.login(token);
