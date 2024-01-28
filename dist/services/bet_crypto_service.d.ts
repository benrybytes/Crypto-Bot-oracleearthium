import IUserBetting from "../interfaces/user_betting.interface";
declare function getUsersBettingFromServerId(serverId: string): Promise<any>;
declare function getUsersFromServerId(serverId: string): Promise<any>;
declare function addUserToBetting(serverId: string, uid: string, bet_amount: number, symbol: string, username: string, cryptoIncrease: boolean, current_price: number): Promise<IUserBetting[] | undefined>;
declare const _default: {
    addUserToBetting: typeof addUserToBetting;
    getUsersFromServerId: typeof getUsersFromServerId;
    getUsersBettingFromServerId: typeof getUsersBettingFromServerId;
    getUserBettingByUid: (serverId: string, uid: string) => Promise<{
        user_betting: any;
        user: any;
    }>;
};
export default _default;
