import * as fs from "fs";
import {
  Collection,
  Guild,
  GuildManager,
  GuildMember,
  PermissionsBitField,
  User,
  Client
} from "discord.js";
import IUser from "../interfaces/users.interface";
import { IServerData } from "../interfaces/server_data.interface";
import { IGuildWithUsers } from "../interfaces/server.interface";
import { emptyOrRows, query } from "../services/db";


class Users {
  private static instance: Users; // Singleton instance
  private static client: Client; // Discord client
  private static serverData: IServerData = {
    servers: [],
  };

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static setClient(client: Client): void {
    Users.client = client;
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
  public findUserWhereIsAdminById = async (uid: string): Promise<Guild[]> => {
    try {
      const serversWhereUserIsAdmin: Guild[] = [];
      console.log("server length in serverswhereuserisadmin: ", Users.getServers().length);

      for (let i = 0; i < Users.getServers().length; i++) {
        try {
          const adminStatus: GuildMember | undefined = await this.lookThroughServersAdmin(await Users.client.guilds.fetch(Users.getServers()[i].guild.id), uid)
          console.log("admin status: ", adminStatus)
          if (adminStatus !== undefined) {
            serversWhereUserIsAdmin.push(Users.getServers()[i].guild);
          }
        } catch (error) {
          console.error("Error while looking through server for admin:", error);
        }
      }
      return serversWhereUserIsAdmin;
    } catch (error) {
      console.error("Error while finding user where user is admin:", error);
      return []; // Return an empty array if an error occurs
    }
  };

  public lookThroughServersAdmin = async (
    server: Guild,
    uid: string,
  ): Promise<GuildMember | undefined> => {
    try {
      // Fetch the member by user ID
      let member: GuildMember | undefined;
      try {
        member = await server.members.fetch(uid);
        // Handle member data
      } catch (error) {
        console.error('Error fetching member:', error);
      }

      // Check if member is not undefined and has administrator permissions and matches the user ID
      if (member?.permissions.has(PermissionsBitField.Flags.Administrator) && member.user.id === uid) {
        console.log("admin: ", member.user);
        return member;
      }
      return undefined;
    } catch (error) {
      console.error("Error while looking through servers for admin:", error);
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

  public static setUsersInServerId = (serverId: string, updatedUsersList: IUser[]) => {
    Users.getServers()[Users.getServerIndex(serverId)].users = updatedUsersList;
    Users.saveServersToFile();
  }

  // Set servers data with guild and users stored in json file
  public static setDataInServerData = (serverDataFound: IGuildWithUsers[]) => {

    Users.serverData.servers = serverDataFound;
    // Save servers to a file
    Users.saveServersToFile();
  };

  public static getServerIndex(serverId: string): number {

    return Users.serverData.servers.findIndex((server: IGuildWithUsers) => server.guild.id === serverId);
  }

  public static getUsersAtServerId(serverId: string): IUser[] {
    const serverIndex = Users.getServerIndex(serverId);

    if (serverIndex !== -1) {
      return Users.serverData.servers[serverIndex].users
    }
    return [];
  }

  public static getServers = (): IGuildWithUsers[] => {
    // Retrieve servers from a file
    const storedServers = Users.getServersFromFile();

    console.log("stored servers: ", storedServers.length);

    // Use stored servers if available, otherwise use the in-memory servers
    return storedServers.length > 0 ? storedServers : Users.serverData.servers;
  };

  public static saveServersToFile = (): void => {

    // Set saved data to the in-memory servers
    const guildData: IGuildWithUsers[] = [];
    Users.serverData.servers.map((server: IGuildWithUsers) => {
      return guildData.push({
        guild: server.guild,
        users: server.users,
      })
    })

    const serversString = JSON.stringify(Users.serverData);
    fs.writeFileSync("servers.json", serversString);
  };

  private static removeValue(value: Guild, index: number, arr: IGuildWithUsers[], serverId: string) {
    // If the value at the current array index matches the specified value (2)
    if (value.id === serverId) {
      // Removes the value from the original array
      arr.splice(index, 1);
      return true;
    }
    return false;
  }

  // Pass the removeValue function into the filter function to return the specified value
  public static deleteServer = (server: Guild) => {

    Users.serverData.servers = Users.getServers().filter((value: IGuildWithUsers, index: number, arr: IGuildWithUsers[]) => Users.removeValue(value.guild, index, arr, server.id));
    Users.saveServersToFile();
  }

  public static addNewServer = (server: Guild) => {
    Users.getServers().push({
      guild: server,
      users: [],
    }); // Add new server to the array
    Users.saveServersToFile();
  }

  private static getServersFromFile = (): IGuildWithUsers[] => {
    try {
      const serversString = fs.readFileSync("servers.json", "utf-8");
      return JSON.parse(serversString);
    } catch (error) {
      return [];
    }
  };
}

export default Users;
