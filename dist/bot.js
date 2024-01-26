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
const users_1 = __importDefault(require("./handlers/users"));
const db_1 = require("./services/db");
const fetchHandler_1 = __importDefault(require("./helpers/fetchHandler"));
const path_1 = __importDefault(require("path"));
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
// Servers bot has access to
let guilds;
let usersForEachServer; // Members of different servers in their respective servers made of users
// When bot is ready, make global commands |
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.createTable)();
    yield (0, db_1.createDiscordDataTable)();
    console.log("Discord bot is ready! 🤖");
    // Get the servers saved in the cache of the discord bot
    guilds = client.guilds;
    users.setServers(guilds);
    usersForEachServer = yield Promise.all(users_1.default.getServers().map((server) => __awaiter(void 0, void 0, void 0, function* () { return yield users.fetchMembers(server); })));
    const handleUsersNewInput = (serverId, server) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if the server exists in the database
        const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;
        const result = yield (0, db_1.query)(checkServerSQL, [serverId]);
        // If an array, we know we could move on to compare its elements
        if (Array.isArray(result) && result.length === 0) {
            // Server not present, add it
            const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
      VALUES (?, ?, '[]');
    `;
            const findUsersInServer = users_1.default.getServers().find((e) => e.id == serverId);
            const discordServerUsers = yield findUsersInServer.members.fetch();
            // Set users data for all servers bot is connected to if no table is found
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
            // Convert serverUsers to a JSON string before inserting
            const usersJson = JSON.stringify(usersInDiscordServerData);
            yield (0, db_1.query)(addServerSQL, [serverId, usersJson]);
            console.log(`Server with serverId ${serverId} added.`);
        }
    });
    users_1.default.getServers().map((server) => {
        handleUsersNewInput(server.id, server);
    });
    yield (0, registerCommands_1.registerCommands)({ guildId: "", commands: commandList_1.default });
}));
client.on("guildMemberRemove", (member) => __awaiter(void 0, void 0, void 0, function* () {
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
    const usersResult = (0, db_1.emptyOrRows)(yield (0, db_1.query)(getUsersSQL, [serverId]));
    const usersJson = usersResult[0].users.filter((user) => user.uid !== memberId);
    const result = (0, db_1.emptyOrRows)(yield (0, db_1.query)(removeBetCryptoUserSQL, [usersJson, serverId]));
    console.log("DELTED USER: ", result);
}));
client.on("guildMemberAdd", (member) => __awaiter(void 0, void 0, void 0, function* () {
    const serverId = member.guild.id;
    console.log(`New member joined server with ID: ${serverId}`);
    const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;
    const result = yield (0, db_1.query)(checkServerSQL, [serverId]);
    console.log("RESULT: ", result);
    if (Array.isArray(result) && result.length > 0) {
        // Server present, add the new member to the users array
        const addUserSQL = `
      UPDATE bet_crypto
SET users = JSON_MERGE_PRESERVE(COALESCE(users, '[]'), CAST(? AS JSON))
WHERE serverId = ?;

    `;
        const newUser = {
            uid: member.id,
            username: member.user.username,
            points: 0,
        };
        const addUserSQLResult = yield (0, db_1.query)(addUserSQL, [
            JSON.stringify(newUser),
            serverId,
        ]);
        console.log(addUserSQLResult);
        console.log(`User with UID ${member.id} added to server ${serverId}.`);
    }
    else {
        // Server not present, add it with the new member
        const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
VALUES (?, CAST('[{"uid": ?, "username": ?, "points": 0}]' AS JSON), '[]');

    `;
        yield (0, db_1.query)(addServerSQL, [serverId]);
        console.log(`Server with serverId ${serverId} added with the new member.`);
    }
    // Your existing code...
}));
client.on("guildCreate", (guild) => __awaiter(void 0, void 0, void 0, function* () {
    const serverId = guild.id;
    const checkServerSQL = `
    SELECT *
    FROM bet_crypto
    WHERE serverId = ?;
  `;
    const result = yield (0, db_1.query)(checkServerSQL, [serverId]);
    if (!Array.isArray(result) || result.length === 0) {
        // Server not present, add it with empty users and usersBetting arrays
        const addServerSQL = `
      INSERT INTO bet_crypto (serverId, users, usersBetting)
      VALUES (?, '[]', '[]');
    `;
        yield (0, db_1.query)(addServerSQL, [serverId]);
        console.log(`Server with serverId ${serverId} added.`);
    }
    else {
        console.log(`Server with serverId ${serverId} already exists.`);
    }
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
            const getUsersSQL = `
  SELECT users 
  FROM bet_crypto 
  WHERE serverId = ?;
`;
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
            // Convert the array back to a JSON string
            const updatedUsersJSON = usersArray;
            // Update the users column in the database
            const updatePointsSQL = `
  UPDATE bet_crypto
  SET users = ?
  WHERE serverId = ?`;
            // Execute the query with the necessary parameters
            yield (0, db_1.query)(updatePointsSQL, [updatedUsersJSON, serverId]);
        });
    }
    function getAllUserBetting(serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const getAllUserBettingSQL = `
      SELECT usersBetting
      FROM bet_crypto
      WHERE serverId = ?;
    `;
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
            const result = yield (0, db_1.query)(addPointsToUsersSQL, [pointIncrement, serverId]);
            const row = (0, db_1.emptyOrRows)(result);
        });
    }
    users_1.default.getServers().map((server) => getAllUserBetting(server.id));
    users_1.default.getServers().map((server) => addPointsToUsers(server.id, 50));
    // Reset all users that are betting after calculating which one's got it correct
    const resetUsersBettingSQL = `
    UPDATE bet_crypto
    SET usersBetting = '[]';
  `;
    yield (0, db_1.query)(resetUsersBettingSQL, []);
});
