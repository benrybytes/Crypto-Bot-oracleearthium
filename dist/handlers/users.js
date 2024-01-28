"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const discord_js_1 = require("discord.js");
class Users {
    constructor() {
        this.fetchMembers = (server) => __awaiter(this, void 0, void 0, function* () {
            if (server instanceof discord_js_1.Guild) {
                try {
                    const res = yield server.members.fetch();
                    const users = res.map((member) => member.user);
                    return users;
                }
                catch (error) {
                    console.error("Error fetching members:", error);
                    return [];
                }
            }
            else {
                console.error("Invalid server type:", typeof server);
                return [];
            }
        });
        this.findUserWhereIsAdminById = (uid) => __awaiter(this, void 0, void 0, function* () {
            try {
                const serversWhereUserIsAdmin = [];
                console.log("server length in serverswhereuserisadmin: ", Users.getServers().length);
                for (let i = 0; i < Users.getServers().length; i++) {
                    try {
                        const adminStatus = yield this.lookThroughServersAdmin(yield Users.client.guilds.fetch(Users.getServers()[i].guild.id), uid);
                        console.log("admin status: ", adminStatus);
                        if (adminStatus !== undefined) {
                            serversWhereUserIsAdmin.push(Users.getServers()[i].guild);
                        }
                    }
                    catch (error) {
                        console.error("Error while looking through server for admin:", error);
                    }
                }
                return serversWhereUserIsAdmin;
            }
            catch (error) {
                console.error("Error while finding user where user is admin:", error);
                return []; // Return an empty array if an error occurs
            }
        });
        this.lookThroughServersAdmin = (server, uid) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch the member by user ID
                let member;
                try {
                    member = yield server.members.fetch(uid);
                    // Handle member data
                }
                catch (error) {
                    console.error('Error fetching member:', error);
                }
                // Check if member is not undefined and has administrator permissions and matches the user ID
                if ((member === null || member === void 0 ? void 0 : member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator)) && member.user.id === uid) {
                    console.log("admin: ", member.user);
                    return member;
                }
                return undefined;
            }
            catch (error) {
                console.error("Error while looking through servers for admin:", error);
                return undefined; // Return undefined if an error occurs
            }
        });
        this.findListWhereUserIsAdmin = (users, id) => {
            const user = users.find((user) => user.id === id);
            return user ? user : null;
        };
        this.listServersIndexesUserIsAdmin = (usersForEachServer, id) => {
            const serversIndexes = [];
            usersForEachServer.map((users, serverIndex) => {
                if (this.findListWhereUserIsAdmin(users, id) !== null) {
                    serversIndexes.push(serverIndex);
                }
            });
            return serversIndexes;
        };
        // Private constructor to prevent instantiation
    }
    static setClient(client) {
        Users.client = client;
    }
    static getInstance() {
        if (!Users.instance) {
            Users.instance = new Users();
            console.log("create new instance");
        }
        console.log("get instance");
        return Users.instance;
    }
    static getServerIndex(serverId) {
        return Users.serverData.servers.findIndex((server) => server.guild.id === serverId);
    }
    static getUsersAtServerId(serverId) {
        const serverIndex = Users.getServerIndex(serverId);
        if (serverIndex !== -1) {
            return Users.serverData.servers[serverIndex].users;
        }
        return [];
    }
    static removeValue(value, index, arr, serverId) {
        // If the value at the current array index matches the specified value (2)
        if (value.id === serverId) {
            // Removes the value from the original array
            arr.splice(index, 1);
            return true;
        }
        return false;
    }
}
Users.serverData = {
    servers: [],
};
Users.setUsersInServerId = (serverId, updatedUsersList) => {
    Users.getServers()[Users.getServerIndex(serverId)].users = updatedUsersList;
    Users.saveServersToFile();
};
// Set servers data with guild and users stored in json file
Users.setDataInServerData = (serverDataFound) => {
    Users.serverData.servers = serverDataFound;
    // Save servers to a file
    Users.saveServersToFile();
};
Users.getServers = () => {
    // Retrieve servers from a file
    const storedServers = Users.getServersFromFile();
    console.log("stored servers: ", storedServers.length);
    // Use stored servers if available, otherwise use the in-memory servers
    return storedServers.length > 0 ? storedServers : Users.serverData.servers;
};
Users.saveServersToFile = () => {
    // Set saved data to the in-memory servers
    const guildData = [];
    Users.serverData.servers.map((server) => {
        return guildData.push({
            guild: server.guild,
            users: server.users,
        });
    });
    const serversString = JSON.stringify(Users.serverData);
    fs.writeFileSync("servers.json", serversString);
};
// Pass the removeValue function into the filter function to return the specified value
Users.deleteServer = (server) => {
    Users.serverData.servers = Users.getServers().filter((value, index, arr) => Users.removeValue(value.guild, index, arr, server.id));
    Users.saveServersToFile();
};
Users.addNewServer = (server) => {
    Users.getServers().push({
        guild: server,
        users: [],
    }); // Add new server to the array
    Users.saveServersToFile();
};
Users.getServersFromFile = () => {
    try {
        const serversString = fs.readFileSync("servers.json", "utf-8");
        return JSON.parse(serversString);
    }
    catch (error) {
        return [];
    }
};
exports.default = Users;
