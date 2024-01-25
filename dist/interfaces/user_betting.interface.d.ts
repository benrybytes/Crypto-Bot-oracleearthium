export default interface IUserBetting {
    uid: string;
    username: string;
    symbol: string;
    bet_amount: number;
    cryptoIncrease: boolean;
    current_price: number;
}
