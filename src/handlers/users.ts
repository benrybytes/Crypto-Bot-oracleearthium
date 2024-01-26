import * as fs from "fs";
import {
  Collection,
  Guild,
  GuildManager,
  GuildMember,
  PermissionsBitField,
  User,
} from "discord.js";

class Users {
  private static instance: Users; // Singleton instance
  private static servers: Guild[] = []; // Static property

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): Users {
    if (!Users.instance) {
      Users.instance = new Users();
      console.log("create new instance");
    }
    console.log("get instance");
    return Users.instance;
  }

  public fetchMembers = async (server: Guild): Promise<User[]> => {
    if (server instanceof Guild) {
      try {
        const res: Collection<string, GuildMember> =
          await server.members.fetch();
        const users: User[] = res.map((member: GuildMember) => member.user);
        return users;
      } catch (error) {
        console.error("Error fetching members:", error);
        return [];
      }
    } else {
      console.error("Invalid server type:", typeof server);
      return [];
    }
  };
  public findUserWhereIsAdminById = (uid: string): Guild[] => {
    const serversWhereUserIsAdmin: Guild[] = [];
    console.log("server length: ", Users.getServers().length);

    for (let i = 0; i < Users.getServers().length; i++) {
      if (
        this.lookThroughServersAdmin(Users.getServers()[i], uid) !== undefined
      ) {
        serversWhereUserIsAdmin.push(Users.getServers()[i]);
      }
    }
    return serversWhereUserIsAdmin;
  };

  public lookThroughServersAdmin = async (
    server: Guild,
    uid: string,
  ): Promise<GuildMember | undefined> => {
    try {
      // Fetch the members of the server
      const members = await server.members.fetch();

      // Find the admin member
      const admin = members.find(
        (member) =>
          member.permissions.has(PermissionsBitField.Flags.Administrator) &&
          member.id === uid,
      );

      return admin || undefined; // Return admin if found, otherwise undefined
    } catch (error) {
      console.error("Error fetching server members:", error);
      return undefined; // Return undefined if an error occurs
    }
  };

  public findListWhereUserIsAdmin = (
    users: User[],
    id: string,
  ): User | null => {
    const user = users.find((user) => user.id === id);
    return user ? user : null;
  };

  public listServersIndexesUserIsAdmin = (
    usersForEachServer: User[][],
    id: string,
  ): number[] => {
    const serversIndexes: number[] = [];

    usersForEachServer.map((users: User[], serverIndex: number) => {
      if (this.findListWhereUserIsAdmin(users, id) !== null) {
        serversIndexes.push(serverIndex);
      }
    });
    return serversIndexes;
  };

  public setServers = (guilds: GuildManager) => {
    Users.servers = guilds.cache.map((value: Guild) => value.members.guild);

    // Save servers to a file
    this.saveServersToFile();
  };

  public static getServers = () => {
    // Retrieve servers from a file
    const storedServers = this.getServersFromFile();

    console.log("stored servers: ", storedServers.length);

    // Use stored servers if available, otherwise use the in-memory servers
    return storedServers.length > 0 ? storedServers : Users.servers;
  };

  private saveServersToFile = () => {
    const serversString = JSON.stringify(Users.servers);
    fs.writeFileSync("servers.json", serversString);
  };

  private static getServersFromFile = (): Guild[] => {
    try {
      const serversString = fs.readFileSync("servers.json", "utf-8");
      return JSON.parse(serversString);
    } catch (error) {
      return [];
    }
  };
}

export default Users;
