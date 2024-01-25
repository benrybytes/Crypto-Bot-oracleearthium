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
const discord_js_1 = require("discord.js");
/*
    Be used to manage servers that the user either owns or is a administrator

*/
class Users {
    constructor() {
        this.servers = []; // Stores the servers where people in the server are
        this.usersForEachServer = [[]]; // Data about each server's user base
        /*
              Fetch method to get latest server member list
              @param server - The server to search a user list specific to that server
          */
        this.fetchMembers = (server) => __awaiter(this, void 0, void 0, function* () {
            const res = yield server.members.fetch();
            // Go through every Guild Member key and make it a user
            const users = res.map((member) => member.user);
            return users;
        });
        /*
          Look through each server and find which server where the bot is, the uid of the user is
      */
        this.findUserWhereIsAdminById = (uid) => {
            // Store list of servers with user as admin
            const serversWhereUserIsAdmin = [];
            for (let i = 0; i < this.servers.length; i++) {
                if (this.lookThroughServersAdmin(this.servers[i], uid) != undefined) {
                    serversWhereUserIsAdmin.push(this.servers[i]);
                }
            }
            return serversWhereUserIsAdmin;
        };
        /*
          Get a server and look through each member and see whether it is the user and if the user is an administrator
          @param server - The guild representing a discord server
          @param uid - The user we are looking to be an admin
      */
        this.lookThroughServersAdmin = (server, uid) => __awaiter(this, void 0, void 0, function* () {
            const res = yield server.members.fetch();
            // Find admin in each server and store the server index
            const admin = res.find((member) => member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator) ==
                true && member.id == uid);
            return admin != undefined ? admin : undefined;
        });
        this.findListWhereUserIsAdmin = (users, id) => {
            const user = users.find((user) => user.id == id);
            return user ? user : null;
        };
        this.listServersIndexesUserIsAdmin = (usersForEachServer, id) => {
            const serversIndexes = [];
            // Check each server bot is in for user that is found
            usersForEachServer.map((users, serverIndex) => {
                if (this.findListWhereUserIsAdmin(users, id) != null) {
                    serversIndexes.push(serverIndex);
                }
            });
            return serversIndexes;
        };
        this.setServers = (guilds) => {
            this.servers = guilds.cache.map((value) => value.members.guild);
        };
        this.getServers = () => {
            return this.servers;
        };
    }
}
exports.default = Users;
