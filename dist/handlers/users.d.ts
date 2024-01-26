import { Guild, GuildManager, GuildMember, User } from "discord.js";
declare class Users {
    private static instance;
    private static servers;
    private constructor();
    static getInstance(): Users;
    fetchMembers: (server: Guild) => Promise<User[]>;
    findUserWhereIsAdminById: (uid: string) => Guild[];
    lookThroughServersAdmin: (server: Guild, uid: string) => Promise<GuildMember | undefined>;
    findListWhereUserIsAdmin: (users: User[], id: string) => User | null;
    listServersIndexesUserIsAdmin: (usersForEachServer: User[][], id: string) => number[];
    setServers: (guilds: GuildManager) => void;
    static getServers: () => Guild[];
    private saveServersToFile;
    private static getServersFromFile;
}
export default Users;
