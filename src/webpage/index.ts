import { Response, Request } from "express";
import path from "path";
import express from "express";
import Users from "../handlers/users";
import { Guild } from "discord.js";
import bodyParser from "body-parser";

const rootDir = path.join(__dirname, "../../", "dist");
console.log(rootDir);

const app = express();
let userHandlers: Users;
// Use middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Use middleware to parse application/json
app.use(bodyParser.json());

// Serve static files from the dist directory

// Serve static files in the 'dist' directory
//app.set("dist", express.static(path.join(__dirname, "dist")));

// Serve static files from the 'dist' directory
app.use("/dist", express.static(rootDir));
// Serve static files in the 'styles' directory
app.set("styles", express.static(path.join(__dirname, "styles")));
// HTTP Request
app.get("/:id", (request: Request, response: Response) => {
  const uid = request.params.id;
  const serversWithUserAsAdmin: Guild[] =
    userHandlers.findUserWhereIsAdminById(uid);

  response.status(200).send({ servers: serversWithUserAsAdmin });
});

// PAGE NAVIGATIONS

app.get("/card-data", (req: Request, res: Response) => {
  const uid: string | undefined = req.query.uid as string | undefined;
  const index: number | undefined = parseInt(req.query.index as string);

  if (uid !== undefined && !isNaN(index)) {
    const serversWithUserAsAdmin: Guild[] =
      userHandlers.findUserWhereIsAdminById(uid);

    if (index >= 0 && index < serversWithUserAsAdmin.length) {
      res.json({
        server_data: serversWithUserAsAdmin[index],
      });
    } else {
      res.status(400).send({ error: "Invalid index" });
    }
  } else {
    res.status(400).send({ error: "Invalid query parameters" });
  }
});

app.get("/card-page/:id", (req: Request, res: Response) => {
  res.status(200).sendFile("./src/webpage/view/view.html", { root: "." });
});

// Using CSS styles folder with static files
app.use("/styles", express.static(path.join(__dirname, "styles")));

app.get("/", (_request: Request, response: Response) => {
  return response.sendFile("./src/webpage/main.html", { root: "." });
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
