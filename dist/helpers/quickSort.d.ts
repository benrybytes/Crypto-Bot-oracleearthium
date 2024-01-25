import { IPriceList } from "../interfaces/price_list.interface";
import IUser from "../interfaces/users.interface";
declare function quickSort<T extends IPriceList | IUser>(array: T[], key: keyof T): T[];
export default quickSort;
