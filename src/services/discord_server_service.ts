
import addPointsToUsersSQL from "../mysql/add_points_to_users";
import { emptyOrRows, query } from "./db";

const reset_leaderboard_in_db = async (serverid: string) => {
  emptyOrRows(query(addPointsToUsersSQL, [0, serverid]));
};

export default {
  reset_leaderboard_in_db,
};
