import { warn } from "console";
import {
  Collection,
  Guild,
  GuildManager,
  GuildMember,
  PermissionsBitField,
  User,
} from "discord.js";

/*
    Be used to manage servers that the user either owns or is a administrator

*/
class Users {
  private servers: Guild[] = []; // Stores the servers where people in the server are
  private usersForEachServer: User[][] = [[]]; // Data about each server's user base

  /* 
        Fetch method to get latest server member list
        @param server - The server to search a user list specific to that server
    */
  public fetchMembers = async (server: Guild): Promise<User[]> => {
    const res: Collection<string, GuildMember> = await server.members.fetch();

    // Go through every Guild Member key and make it a user
    const users: User[] = res.map((member: GuildMember) => member.user);

    return users;
  };
  /* 
    Look through each server and find which server where the bot is, the uid of the user is
*/
  public findUserWhereIsAdminById = (uid: string): Guild[] => {
    // Store list of servers with user as admin
    const serversWhereUserIsAdmin: Guild[] = [];

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
  public lookThroughServersAdmin = async (
    server: Guild,
    uid: string,
  ): Promise<GuildMember | undefined> => {
    const res: Collection<string, GuildMember> = await server.members.fetch();

    // Find admin in each server and store the server index
    const admin: GuildMember | undefined = res.find(
      (member) =>
        member.permissions.has(PermissionsBitField.Flags.Administrator) ==
          true && member.id == uid,
    );
    return admin != undefined ? admin : undefined;
  };

  public findListWhereUserIsAdmin = (
    users: User[],
    id: string,
  ): User | null => {
    const user = users.find((user) => user.id == id);

    return user ? user : null;
  };

  public listServersIndexesUserIsAdmin = (
    usersForEachServer: User[][],
    id: string,
  ): number[] => {
    const serversIndexes: number[] = [];

    // Check each server bot is in for user that is found
    usersForEachServer.map((users: User[], serverIndex: number) => {
      if (this.findListWhereUserIsAdmin(users, id) != null) {
        serversIndexes.push(serverIndex);
      }
    });
    return serversIndexes;
  };

  public setServers = (guilds: GuildManager) => {
    this.servers = guilds.cache.map((value: Guild) => value.members.guild);
  };
  public getServers = () => {
    return this.servers;
  };
}

export default Users;
