import { ICommand } from "./commands/commandList";
type DeployCommandsProps = {
    guildId: string;
    commands: ICommand[];
};
export declare function registerCommands({ guildId, commands, }: DeployCommandsProps): Promise<void>;
export {};
