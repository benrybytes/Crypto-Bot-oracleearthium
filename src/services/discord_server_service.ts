import adjust_all_server_users_points from "../mysql/adjust_all_server_users_points";
import { emptyOrRows, query } from "./db";

const reset_leaderboard_in_db = async (serverid: string) => {
  emptyOrRows(query(adjust_all_server_users_points, [0, serverid]));
};

export default {
  reset_leaderboard_in_db,
};
