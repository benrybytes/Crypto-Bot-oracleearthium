"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./handlers/users"));
const webpage_1 = __importDefault(require("./webpage"));
const users = users_1.default.getInstance();
(0, webpage_1.default)(users);
