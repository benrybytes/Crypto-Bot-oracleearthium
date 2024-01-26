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
var _a;
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
        this.findUserWhereIsAdminById = (uid) => {
            const serversWhereUserIsAdmin = [];
            console.log("server length: ", _a.getServers().length);
            for (let i = 0; i < _a.getServers().length; i++) {
                if (this.lookThroughServersAdmin(_a.getServers()[i], uid) !== undefined) {
                    serversWhereUserIsAdmin.push(_a.getServers()[i]);
                }
            }
            return serversWhereUserIsAdmin;
        };
        this.lookThroughServersAdmin = (server, uid) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch the members of the server
                const members = yield server.members.fetch();
                // Find the admin member
                const admin = members.find((member) => member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator) &&
                    member.id === uid);
                return admin || undefined; // Return admin if found, otherwise undefined
            }
            catch (error) {
                console.error("Error fetching server members:", error);
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
        this.setServers = (guilds) => {
            _a.servers = guilds.cache.map((value) => value.members.guild);
            // Save servers to a file
            this.saveServersToFile();
        };
        this.saveServersToFile = () => {
            const serversString = JSON.stringify(_a.servers);
            fs.writeFileSync("servers.json", serversString);
        };
        // Private constructor to prevent instantiation
    }
    static getInstance() {
        if (!_a.instance) {
            _a.instance = new _a();
            console.log("create new instance");
        }
        console.log("get instance");
        return _a.instance;
    }
}
_a = Users;
Users.servers = []; // Static property
Users.getServers = () => {
    // Retrieve servers from a file
    const storedServers = _a.getServersFromFile();
    console.log("stored servers: ", storedServers.length);
    // Use stored servers if available, otherwise use the in-memory servers
    return storedServers.length > 0 ? storedServers : _a.servers;
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
