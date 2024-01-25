"use strict";
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
exports.createDiscordDataTable = exports.createTable = exports.query = exports.getOffset = exports.emptyOrRows = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const path_1 = __importDefault(require("path"));
const env = process.env.NODE_ENV || "development";
const config = require(path_1.default.join(__dirname, "../config/db_config"))[env];
const dbUsername = config.username;
const dbPassword = config.password;
const dbHost = config.host;
const dbDatabaseName = config.database;
if (!dbUsername || !dbPassword || !dbHost) {
    throw new Error("DB_USERNAME environment variables must be set");
}
function query(sql, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = promise_1.default.createPool({
            host: dbHost,
            user: dbUsername,
            password: dbPassword,
            database: dbDatabaseName,
            port: config.port,
            connectTimeout: 60000,
        });
        const [results] = yield connection.execute(sql, params);
        return results;
    });
}
exports.query = query;
function createTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tracked_crypto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serverId VARCHAR(255),
  coinData JSON
);  `;
        yield query(createTableSQL, []);
    });
}
exports.createTable = createTable;
function createDiscordDataTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const createTableSQL = `
   

CREATE TABLE IF NOT EXISTS bet_crypto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serverId VARCHAR(255),
  day TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  users JSON,
  usersBetting JSON,
  INDEX (serverId)

);  `;
        try {
            yield query(createTableSQL, []);
            console.log("Table created successfully");
        }
        catch (error) {
            console.error("Error creating table:", error);
            throw error;
        }
    });
}
exports.createDiscordDataTable = createDiscordDataTable;
function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * listPerPage;
}
exports.getOffset = getOffset;
function emptyOrRows(rows) {
    if (!rows) {
        return [];
    }
    return rows;
}
exports.emptyOrRows = emptyOrRows;
