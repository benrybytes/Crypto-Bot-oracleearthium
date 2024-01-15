import { Response, Request } from "express";

import path from "path";
import express from "express";
import Users from "../handlers/users";
import { Guild } from "discord.js";

const app = express();
let userHandlers: Users;
app.use((_req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});
app.use("", express.static(path.join(__dirname, "public")));

app.get("/", (_request: Request, response: Response) => {
  return response.sendFile("./src/webpage/main.html", { root: "." });
});

app.get("/:id", (request: Request, response: Response) => {
  const uid = request.params.id;
  const serversWithUserAsAdmin: Guild[] =
    userHandlers.findUserWhereIsAdminById(uid);

  response.status(200).send({ servers: serversWithUserAsAdmin });
});

// Gets called by the discord redirect to get the dashboard
app.get("/auth/discord", (_request: Request, response: Response) => {
  return response.sendFile("./src/webpage/dashboard.html", { root: "." });
});

const port = "53134";
app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`),
);

export default function createApp(userObject: Users) {
  userHandlers = userObject;
  return app;
}
