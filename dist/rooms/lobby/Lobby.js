"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyRoom = void 0;
const colyseus_1 = require("colyseus");
const utils_1 = require("../../utils");
class LobbyRoom extends colyseus_1.Room {
    constructor() {
        super();
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logger = new utils_1.Logger("Room_Lobby");
    }
    onCreate() {
        this.logger.logInfo(`Room created`);
    }
    onJoin(client) {
        this.logger.logInfo(`Client joined: ${client.id}`);
    }
    onLeave(client) {
        this.logger.logInfo(`Client left: ${client.id}`);
    }
}
exports.LobbyRoom = LobbyRoom;
//# sourceMappingURL=Lobby.js.map