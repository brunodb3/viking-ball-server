import "dotenv/config";
import NodeHTTP from "http";
import Express from "express";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { WebSocketTransport } from "@colyseus/ws-transport";

import { Logger } from "@utils";
import { LobbyRoom, MatchRoom } from "@rooms";

const express = Express();
const logger = new Logger("main");
const httpServer = NodeHTTP.createServer(express);
const colyseus = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

const port = parseInt(process.env.PORT || "8000", 10);

colyseus.define("lobby", LobbyRoom);
colyseus.define("match", MatchRoom);

express.use("/", monitor());

colyseus.listen(port);
logger.logInfo(`Server started on port ${port}`);
