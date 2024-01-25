import { Guild, GuildManager, GuildMember, User } from "discord.js";
declare class Users {
    private servers;
    private usersForEachServer;
    fetchMembers: (server: Guild) => Promise<User[]>;
    findUserWhereIsAdminById: (uid: string) => Guild[];
    lookThroughServersAdmin: (server: Guild, uid: string) => Promise<GuildMember | undefined>;
    findListWhereUserIsAdmin: (users: User[], id: string) => User | null;
    listServersIndexesUserIsAdmin: (usersForEachServer: User[][], id: string) => number[];
    setServers: (guilds: GuildManager) => void;
    getServers: () => Guild[];
}
export default Users;
