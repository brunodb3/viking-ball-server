"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const colyseus_1 = require("colyseus");
const monitor_1 = require("@colyseus/monitor");
const ws_transport_1 = require("@colyseus/ws-transport");
const utils_1 = require("./utils");
const rooms_1 = require("./rooms");
const express = (0, express_1.default)();
const logger = new utils_1.Logger("main");
const httpServer = http_1.default.createServer(express);
const colyseus = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({ server: httpServer }),
});
const port = parseInt(process.env.PORT || "8000", 10);
colyseus.define("lobby", rooms_1.LobbyRoom);
colyseus.define("match", rooms_1.MatchRoom);
express.use("/", (0, monitor_1.monitor)());
colyseus.listen(port);
logger.logInfo(`Server started on port ${port}`);
//# sourceMappingURL=main.js.map