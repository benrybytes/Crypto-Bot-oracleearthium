import Users from "../handlers/users";
export default function createApp(userObject: Users): Promise<import("express-serve-static-core").Express>;
