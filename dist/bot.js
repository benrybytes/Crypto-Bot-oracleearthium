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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const registerCommands_1 = require("./registerCommands");
const commandList_1 = __importDefault(require("./commands/commandList")); // Import the commands directly
const index_1 = __importDefault(require("./webpage/index"));
const users_1 = __importDefault(require("./handlers/users"));
const db_1 = require("./services/db");
const fetchHandler_1 = __importDefault(require("./helpers/fetchHandler"));
const path_1 = __importDefault(require("path"));
const add_points_to_users_1 = __importDefault(require("./mysql/add_points_to_users"));
const env = process.env.NODE_ENV || "development";
const config = require(path_1.default.join(__dirname, "/config/discord_config"))[env];
const token = config.discord_token;
// bot created for server with permissions
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
});
const users = users_1.default.getInstance();
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
let guilds;
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    users_1.default.setClient(client);
    yield (0, db_1.createTable)();
    yield (0, db_1.createDiscordDataTable)();
    console.log("Discord bot is ready! 🤖");
    // Get the servers saved in the cache of the discord bot
    guilds = client.guilds;
    // Resolve the database data into an array of objects
    const guildWithUsersPromises = guilds.cache.map((value) => __awaiter(void 0, void 0, void 0, function* () {
        const usersFromDB = (0, db_1.emptyOrRows)((0, db_1.query)(getUsersSQL, [value.id]));
        return {
            guild: value,
            users: usersFromDB,
        };
    }));
    // Wait for all asynchronouse data to be resolved 
    const guildWithUsers = yield Promise.all(guildWithUsersPromises);
    // Now be safely added to server data
    users_1.default.setDataInServerData(guildWithUsers);
    users_1.default.getServers().map((server) => {
        addCurrentUsersInDB(server.guild.id, server.guild);
    });
    yield (0, registerCommands_1.registerCommands)({ guildId: "", commands: commandList_1.default });
}));
client.on("guildMemberRemove", (member) => __awaiter(void 0, void 0, void 0, function* () {
    const serverId = member.guild.id;
    const user = {
        points: 0,
        uid: member.id,
        username: member.user.username,
    };
    // Delete the specific user from the users array in bet_crypto table
    removeUserInUsersInDB(serverId, user);
}));
client.on("guildMemberAdd", (member) => __awaiter(void 0, void 0, void 0, function* () {
    const guild = yield client.guilds.fetch(member.guild.id).then((res) => res);
    const user = {
        points: 0,
        uid: member.id,
        username: member.user.username,
    };
    addUserInUsersInDB(guild.id, user);
}));
client.on("guildCreate", (guild) => __awaiter(void 0, void 0, void 0, function* () {
    const serverId = guild.id;
    // Stored in servers.json if bot rejoins server
    const foundServer = users_1.default.getServerIndex(serverId);
    // New server found for the bot
    if (foundServer == -1) {
        users_1.default.addNewServer(guild);
        addCurrentUsersInDB(serverId, guild);
        return;
    }
    // Previous server found for the bot
    addPreviousWithCurrentUsersInDB(serverId, guild, users_1.default.getUsersAtServerId(serverId));
    ;
}));
// Any interaction created | Command
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand()) {
        return;
    }
    const command = commandList_1.default.find((cmd) => cmd.data.name === interaction.commandName);
    if (command) {
        command.execute(interaction);
    }
}));
console.log("Bot registration process...");
(0, index_1.default)(users);
client.login(token);
let lastExecutionTime;
setInterval(function () {
    const now = new Date();
    // Check if 24 hours have passed since the last execution
    if (!lastExecutionTime ||
        now.getTime() - lastExecutionTime.getTime() >= 12 * 60 * 60 * 1000) {
        lastExecutionTime = now;
        resetLeaderboardAndGivePoints();
    }
}, 12 * 60 * 60 * 1000); // 12 hours interval
const resetLeaderboardAndGivePoints = () => __awaiter(void 0, void 0, void 0, function* () {
    function processUserBetting(userBet, serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid, symbol, bet_amount, cryptoIncrease, current_price } = userBet;
            const [recentPriceFound, _error] = yield (0, fetchHandler_1.default)("https://api.coincap.io/v2/assets?search=" + symbol);
            const trackedCryptoData = yield recentPriceFound.then((res) => res.data[0].priceUsd);
            const userQuery = yield (0, db_1.emptyOrRows)(yield (0, db_1.query)(getUsersSQL, [serverId]));
            const usersArray = userQuery[0].users;
            // Find the user in the array and update points
            const userIndex = usersArray.findIndex((user) => user.uid === uid);
            if (userIndex !== -1) {
                if (parseFloat(trackedCryptoData) > current_price && cryptoIncrease) {
                    usersArray[userIndex].points += bet_amount * 2;
                }
                else {
                    usersArray[userIndex].points -= bet_amount;
                }
            }
            users_1.default.setUsersInServerId(serverId, usersArray);
            // Execute the query with the necessary parameters
            yield (0, db_1.query)(updateUsersInBetCrypto, [usersArray, serverId]);
        });
    }
    function getAllUserBetting(serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, db_1.query)(getAllUserBettingSQL, [serverId]);
            const row = (0, db_1.emptyOrRows)(result);
            if (row) {
                const userBettingArray = row[0].usersBetting;
                console.log("users betting: ", userBettingArray);
                if (userBettingArray && userBettingArray.length > 0) {
                    for (const userBet of userBettingArray) {
                        // Assuming userBet has the necessary properties
                        yield processUserBetting(userBet, serverId);
                    }
                }
                else {
                    console.log(`No userBetting found for serverId ${serverId}.`);
                }
            }
            else {
                console.log(`No data found for serverId ${serverId}.`);
            }
        });
    }
    function addPointsToUsers(serverId, pointIncrement) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, db_1.query)(add_points_to_users_1.default, [pointIncrement, serverId]);
            (0, db_1.emptyOrRows)(result);
        });
    }
    users_1.default.getServers().map((server) => getAllUserBetting(server.guild.id));
    users_1.default.getServers().map((server) => addPointsToUsers(server.guild.id, 50));
    yield (0, db_1.query)(resetUsersBettingSQL, []);
});
const addPreviousWithCurrentUsersInDB = (serverId, guild, previousUsers) => __awaiter(void 0, void 0, void 0, function* () {
    // Current members
    const discordServerUsers = yield guild.members.fetch();
    // Previous members stored
    const newCurrentUsers = discordServerUsers.filter((member) => previousUsers.find((user) => user.uid === member.id) == undefined);
    // Create the new users
    const createUsers = newCurrentUsers.map((member) => {
        return {
            uid: member.id,
            username: member.user.username,
            points: 0,
        };
    });
    const addToPreviousMembers = previousUsers.concat(createUsers);
    yield (0, db_1.emptyOrRows)(yield (0, db_1.query)(updateUsersInBetCrypto, [addToPreviousMembers, serverId]));
});
const addCurrentUsersInDB = (serverId, server) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, db_1.query)(checkServerSQL, [serverId]);
    // If an array, we know we could move on to compare its elements
    if (Array.isArray(result) && result.length === 0) {
        addServerMembersToSQL(server);
    }
});
const removeUserInUsersInDB = (serverId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const usersResult = (0, db_1.emptyOrRows)(yield (0, db_1.query)(getUsersSQL, [serverId]));
    const usersJson = usersResult[0].users.filter((user_found) => user_found.uid !== user.uid);
    users_1.default.setUsersInServerId(serverId, usersJson);
    (0, db_1.emptyOrRows)(yield (0, db_1.query)(updateUsersInBetCrypto, [usersJson, serverId]));
});
// Add one user to the users field in database
const addUserInUsersInDB = (serverId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const user_result = (0, db_1.emptyOrRows)(yield (0, db_1.query)(getUsersSQL, [serverId]));
    user_result.push(user);
    users_1.default.setUsersInServerId(serverId, user_result);
    yield (0, db_1.emptyOrRows)(yield (0, db_1.query)(updateUsersInBetCrypto, [user_result, serverId]));
});
// Add to new servers only, and not to the ones that already exist
const addServerMembersToSQL = (guild) => __awaiter(void 0, void 0, void 0, function* () {
    // Server not present, add it
    const discordServerUsers = yield guild.members.fetch();
    // Create new user list containing data for newly added users 
    const usersInDiscordServerData = discordServerUsers
        .map((member) => {
        var _a;
        if (member.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
            return;
        return {
            uid: member.id,
            username: member.user.username,
            points: 0,
        };
    })
        .filter((user) => user !== undefined);
    yield (0, db_1.query)(addServerSQL, [guild.id, usersInDiscordServerData]);
    console.log(`Server with serverId ${guild.id} added.`);
});
