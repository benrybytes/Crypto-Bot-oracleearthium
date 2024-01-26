import Users from "./handlers/users";
import createApp from "./webpage";

const users = Users.getInstance();

createApp(users);
