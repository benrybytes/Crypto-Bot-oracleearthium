import IUser from "./users.interface";
import { Guild } from "discord.js";
export interface IGuildWithUsers {
    guild: Guild;
    users: IUser[];
}
