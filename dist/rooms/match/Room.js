"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchRoom = void 0;
const colyseus_1 = require("colyseus");
const utils_1 = require("../../utils");
const rooms_1 = require("../../rooms");
class MatchRoom extends colyseus_1.Room {
    constructor() {
        super();
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxClients = 2;
        this.logger = new utils_1.Logger("Room_Match");
    }
    onCreate(options) {
        if (options.private) {
            this.setPrivate();
        }
        this.setState(new rooms_1.Match({
            onEnd: this.onEnd.bind(this),
            onStart: this.onStart.bind(this),
            onScore: this.onScore.bind(this),
        }));
        this.logger.logInfo(`Room created: ${this.roomId}`);
        this.onMessage("input_move", this.onInputMove.bind(this));
        this.onMessage("input_action", this.onInputAction.bind(this));
        this.onMessage("ball_settings", this.onBallSettings.bind(this));
        this.onMessage("match_settings", this.onMatchSettings.bind(this));
        this.onMessage("player_settings", this.onPlayerSettings.bind(this));
    }
    onJoin(client) {
        this.logger.logInfo(`Client joined: ${client.sessionId}`);
        this.state.createPlayer(client.sessionId, this.clients.length === 2);
    }
    onLeave(client) {
        this.lock();
        this.logger.logInfo(`Client left: ${client.sessionId}`);
        this.state.removePlayer(client.sessionId);
    }
    onInputMove(client, input) {
        this.state.playerMove(client.sessionId, input);
    }
    onInputAction(client) {
        this.state.playerAction(client.sessionId);
    }
    onPlayerSettings(client, settings) {
        this.state.changePlayerSettings(client.sessionId, settings);
    }
    onBallSettings(_, settings) {
        this.state.changeBallSettings(settings);
    }
    onMatchSettings(_, settings) {
        this.state.changeMatchSettings(settings);
    }
    onScore(side) {
        this.broadcast("score", { side });
    }
    onEnd(winner, tie) {
        this.lock();
        this.broadcast("match_end", { winner, tie });
    }
    onStart() {
        this.lock();
        this.broadcast("match_start");
    }
}
exports.MatchRoom = MatchRoom;
//# sourceMappingURL=Room.js.map