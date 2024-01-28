import { Guild, GuildMember, User, Client } from "discord.js";
import IUser from "../interfaces/users.interface";
import { IGuildWithUsers } from "../interfaces/server.interface";
declare class Users {
    private static instance;
    private static client;
    private static serverData;
    private constructor();
    static setClient(client: Client): void;
    static getInstance(): Users;
    fetchMembers: (server: Guild) => Promise<User[]>;
    findUserWhereIsAdminById: (uid: string) => Promise<Guild[]>;
    lookThroughServersAdmin: (server: Guild, uid: string) => Promise<GuildMember | undefined>;
    findListWhereUserIsAdmin: (users: User[], id: string) => User | null;
    listServersIndexesUserIsAdmin: (usersForEachServer: User[][], id: string) => number[];
    static setUsersInServerId: (serverId: string, updatedUsersList: IUser[]) => void;
    static setDataInServerData: (serverDataFound: IGuildWithUsers[]) => void;
    static getServerIndex(serverId: string): number;
    static getUsersAtServerId(serverId: string): IUser[];
    static getServers: () => IGuildWithUsers[];
    static saveServersToFile: () => void;
    private static removeValue;
    static deleteServer: (server: Guild) => void;
    static addNewServer: (server: Guild) => void;
    private static getServersFromFile;
}
export default Users;
