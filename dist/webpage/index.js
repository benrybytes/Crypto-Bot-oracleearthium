"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("../services/db");
const env = process.env.NODE_ENV || "development";
const discord_config = require(__dirname + "../../config/discord_config")[env];
const web_config = require(__dirname + "../../config/web_config")[env];
// Routes
const crypto_1 = __importDefault(require("./routes/crypto"));
const commands_1 = __importDefault(require("./routes/commands"));
// HTML manipulating
const node_html_parser_1 = require("node-html-parser");
const fs = __importStar(require("fs"));
function createApp(userObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const rootDir = path_1.default.join(__dirname, "../../");
        const app = express();
        let userHandlers;
        // Use middleware to parse application/x-www-form-urlencoded
        app.use(body_parser_1.default.urlencoded({ extended: false }));
        // Add middleware to set the correct MIME type for JavaScript files
        app.use((req, res, next) => {
            if (req.url.endsWith(".js")) {
                res.type("application/javascript");
            }
            next();
        });
        // Use middleware to parse application/json
        app.use(body_parser_1.default.json());
        console.log("dir: ", path_1.default.join(rootDir, "./dist"));
        // Serve static files from the 'dist' directory
        app.use("/dist", express.static(path_1.default.join(rootDir, "./dist/")));
        // Serve static files in the 'styles' directory
        app.use("/styles", express.static(path_1.default.join(rootDir, "./src/webpage/styles/")));
        // HTTP Request
        app.get("/:id", (request, response) => {
            const uid = request.params.id;
            const serversWithUserAsAdmin = userHandlers.findUserWhereIsAdminById(uid);
            response.status(200).send({ servers: serversWithUserAsAdmin });
        });
        app.use("/crypto", crypto_1.default);
        app.use("/discord-server", commands_1.default);
        app.get("/card-data", (req, res) => {
            const uid = req.query.uid;
            const index = parseInt(req.query.index);
            if (uid !== undefined && !isNaN(index)) {
                const serversWithUserAsAdmin = userHandlers.findUserWhereIsAdminById(uid);
                if (index >= 0 && index < serversWithUserAsAdmin.length) {
                    res.json({
                        server_data: serversWithUserAsAdmin[index],
                    });
                }
                else {
                    console.log("error here");
                    res.status(400).send({ error: "Invalid index" });
                }
            }
            else {
                console.log("error there");
                res.status(400).send({ error: "Invalid query parameters" });
            }
        });
        app.get("/card-page/:id", (_req, res) => {
            fs.readFile("./src/webpage/view/view.html", (_err, html) => {
                // Read the JavaScript file
                fs.readFile("./dist/webpage/scripts/card_page_handler.js", "utf8", (jsErr, jsContent) => {
                    if (jsErr) {
                        console.error(jsErr);
                        res.status(500).send("Internal Server Error");
                        return;
                    }
                    // Make the necessary modifications to the JavaScript content
                    const modifiedJsContent = jsContent.replace(/const baseUrl = "apiBaseUrl";/, `const baseUrl = ${JSON.stringify(web_config.apiBaseUrl)};`);
                    // Replace the script tag content in the HTML with the modified JavaScript content
                    const modifiedHtml = html
                        .toString()
                        .replace(/<script id="card"><\/script>/, `<script type="module">${modifiedJsContent}</script>`);
                    // Send the modified HTML as the response
                    res.send(modifiedHtml);
                });
            });
        });
        // Using CSS styles folder with static files
        app.use("/styles", express.static(path_1.default.join(__dirname, "styles")));
        app.get("/", (_req, res) => {
            fs.readFile("./src/webpage/main.html", "utf8", (err, html) => {
                if (err) {
                    throw err;
                }
                const root = (0, node_html_parser_1.parse)(html);
                // Use cheerio to select elements by ID
                const loginButtonElement = root.getElementById("login-button");
                // Check if the element exists before manipulating it
                if (loginButtonElement) {
                    // Modify the element or do something with it
                    loginButtonElement.setAttribute("href", discord_config.discord_auth);
                }
                else {
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
        app.get("/auth/discord", (_request, response) => {
            fs.readFile("./src/webpage/dashboard.html", (err, html) => {
                response.send(html
                    .toString()
                    // replace all with the global key
                    .replace(/apiBaseUrl/g, JSON.stringify(web_config.apiBaseUrl)));
            });
        });
        const port = "53134";
        app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
        yield (0, db_1.createTable)();
        userHandlers = userObject;
        return app;
    });
}
exports.default = createApp;
