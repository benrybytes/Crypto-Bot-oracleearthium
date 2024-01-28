import { Response, Request, NextFunction } from "express";
import path from "path";
const express = require("express");
import Users from "../handlers/users";
import { Guild } from "discord.js";
import bodyParser from "body-parser";
import { createTable } from "../services/db";
const env = process.env.NODE_ENV || "development";
const discord_config = require(__dirname + "../../config/discord_config")[env];
const web_config = require(__dirname + "../../config/web_config")[env];

// Routes
import crypto from "./routes/crypto";
import discord_server_routes from "./routes/commands";

// HTML manipulating
import { parse } from "node-html-parser";
import * as fs from "fs";

export default async function createApp(userObject: Users) {
  const rootDir = path.join(__dirname, "../../");
  const app = express();
  let userHandlers: Users;
  // Use middleware to parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // Add middleware to set the correct MIME type for JavaScript files
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.endsWith(".js")) {
      res.type("application/javascript");
    }
    next();
  });

  // Use middleware to parse application/json
  app.use(bodyParser.json());
  console.log("dir: ", path.join(rootDir, "./dist"));

  // Serve static files from the 'dist' directory
  app.use("/dist", express.static(path.join(rootDir, "./dist/")));
  // Serve static files in the 'styles' directory
  app.use(
    "/styles",
    express.static(path.join(rootDir, "./src/webpage/styles/")),
  );

  // HTTP Request
  app.get("/get-admin/:id", async (request: Request, response: Response, next: NextFunction) => {
    try {
      const uid = request.params.id as string;
      if (uid.length <= 16) {

        next();
        return;
      }
      console.log("uid: ", uid);
      const serversWithUserAsAdmin: Guild[] = await userHandlers.findUserWhereIsAdminById(uid).then((res) => res);
      console.log("servers with user as admin: ", serversWithUserAsAdmin);
      if (serversWithUserAsAdmin.length === 0) {
        response.status(200).send({ servers: [], message: "No servers owned" });
        return;
      }

      response.status(200).send({ servers: serversWithUserAsAdmin, message: serversWithUserAsAdmin.length + " Servers owned by you" });
    }
    catch (e) {
      console.log("error from: id: ", e);
      response.status(500).send({ servers: [], message: "Error while getting servers owned by user" });
      next();
    }
  });

  app.use("/crypto", crypto);
  app.use("/discord-server", discord_server_routes);

  app.get("/card-data", async (req: Request, res: Response) => {
    const uid: string | undefined = req.query.uid as string | undefined;
    const index: number | undefined = parseInt(req.query.index as string);

    if (uid !== undefined && !isNaN(index)) {
      try {
        const serverWithUserAsAdmin: Guild =
          await userHandlers.findUserWhereIsAdminById(uid).then((res) => res[index]);

        if (index >= 0 && serverWithUserAsAdmin) {
          res.json({
            server_data: serverWithUserAsAdmin,
          });
        } else {
          console.log("error here");
          res.status(400).send({ error: "Invalid index" });
        }

      }

      catch (e) {
        res.status(400).send({ error: "Error while getting server data" });
      }

    }
    else {
      console.log("error there");
      res.status(400).send({ error: "Invalid query parameters" });
    }
  });

  app.get("/card-page/:id", (_req: Request, res: Response) => {
    fs.readFile("./src/webpage/view/view.html", (_err, html) => {
      // Read the JavaScript file
      fs.readFile(
        "./dist/webpage/scripts/card_page_handler.js",
        "utf8",
        (jsErr, jsContent) => {
          if (jsErr) {
            console.error(jsErr);
            res.status(500).send("Internal Server Error");
            return;
          }

          // Make the necessary modifications to the JavaScript content

          const modifiedJsContent = jsContent.replace(
            /const baseUrl = "apiBaseUrl";/,
            `const baseUrl = ${JSON.stringify(web_config.apiBaseUrl)};`,
          );

          // Replace the script tag content in the HTML with the modified JavaScript content
          const modifiedHtml = html
            .toString()
            .replace(
              /<script id="card"><\/script>/,
              `<script type="module">${modifiedJsContent}</script>`,
            );

          // Send the modified HTML as the response
          res.send(modifiedHtml);
        },
      );
    });
  });

  // Using CSS styles folder with static files
  app.use("/styles", express.static(path.join(__dirname, "styles")));

  app.get("/", (_req: Request, res: Response) => {
    fs.readFile("./src/webpage/main.html", "utf8", (err, html: string) => {
      if (err) {
        throw err;
      }

      const root = parse(html);

      // Use cheerio to select elements by ID
      const loginButtonElement = root.getElementById("login-button");

      // Check if the element exists before manipulating it
      if (loginButtonElement) {
        // Modify the element or do something with it
        loginButtonElement.setAttribute("href", discord_config.discord_auth);
      } else {
        console.log("Element with ID not found.");
      }

      const modifiedHtml = root.toString();

      // Write back to the file (if needed)
      fs.writeFile("./src/webpage/main.html", modifiedHtml, "utf8", (err) => {
        if (err) {
          throw err;
        }
        console.log("HTML file has been modified and saved.");
      });

      // Send the modified HTML as a response
      res.status(200).send(modifiedHtml);
    });
  });

  // Gets called by the discord redirect to get the dashboard
  app.get("/auth/discord", (_request: Request, response: Response) => {
    fs.readFile("./src/webpage/dashboard.html", (err, html) => {
      response.send(
        html
          .toString()
          // replace all with the global key
          .replace(/apiBaseUrl/g, JSON.stringify(web_config.apiBaseUrl)),
      );
    });
  });
  const port = parseInt(process.env.EXPRESS_PORT!) || 4020;
  app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`),
  );

  await createTable();
  userHandlers = userObject;
  return app;
}
