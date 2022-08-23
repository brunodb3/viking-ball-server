"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
const victor_1 = __importDefault(require("victor"));
const schema_1 = require("@colyseus/schema");
const matter_js_1 = require("matter-js");
const utils_1 = require("../../utils");
const schemas_1 = require("../../schemas");
class Match extends schema_1.Schema {
    constructor(options) {
        super();
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "physics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ballConstraint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onScore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.fps = 20;
        this.playing = false;
        this.state = "WAITING" /* State.WAITING */;
        this.ballPossession = "none";
        this.settings = {
            match: {
                // ? Match length is in milliseconds
                length: 1 * 1000 * 60,
                maxScore: 5,
            },
            constraint: {
                offsetX: 25,
                offsetY: 20,
                activateDistance: 60,
            },
            tackle: {
                distance: 60,
            },
        };
        this.onEnd = options === null || options === void 0 ? void 0 : options.onEnd;
        this.onStart = options === null || options === void 0 ? void 0 : options.onStart;
        this.onScore = options === null || options === void 0 ? void 0 : options.onScore;
        this.ball = new schemas_1.Ball();
        this.field = new schemas_1.Field();
        this.goalLeft = new schemas_1.Goal("left");
        this.goalRight = new schemas_1.Goal("right");
        this.players = new schema_1.MapSchema();
        this.physics = matter_js_1.Engine.create();
        this.physics.gravity.y = 0;
        matter_js_1.World.add(this.physics.world, [
            this.field.body,
            this.ball.body,
            this.goalLeft.body,
            this.goalRight.body,
        ]);
        const runner = matter_js_1.Runner.create({ isFixed: true });
        matter_js_1.Runner.start(runner, this.physics);
        setInterval(this.tick.bind(this), 1000 / this.fps);
        this.timer = new utils_1.Timer(this.end.bind(this), this.settings.match.length);
    }
    start() {
        this.resetPositions();
        this.timer.start();
        this.playing = true;
        this.state = "IN_PROGRESS" /* State.IN_PROGRESS */;
        if (this.onStart)
            this.onStart();
    }
    stop(state) {
        this.resetPositions();
        this.timer.reset();
        this.playing = false;
        this.state = state || "WAITING" /* State.WAITING */;
    }
    end() {
        this.resetPositions();
        this.timer.stop();
        this.playing = false;
        this.state = "END" /* State.END */;
        let tie = false;
        let winner = {
            id: "",
            score: 0,
        };
        this.players.forEach((player) => {
            if (player.score === winner.score) {
                tie = true;
            }
            else {
                tie = false;
            }
            if (player.score === 0)
                return;
            if (player.score > winner.score) {
                winner = {
                    id: player.id,
                    score: player.score,
                };
            }
        });
        if (this.onEnd)
            this.onEnd(winner.id, tie);
    }
    tick() {
        this.ball.tick();
        this.updateTimeRemaining();
        if (this.isBallOutOfBounds()) {
            this.ball.reset();
        }
        if (this.state === "IN_PROGRESS" /* State.IN_PROGRESS */) {
            if (matter_js_1.Collision.collides(this.ball.body, this.goalLeft.body) != null) {
                this.score("left");
            }
            if (matter_js_1.Collision.collides(this.ball.body, this.goalRight.body) != null) {
                this.score("right");
            }
        }
        this.players.forEach((player) => {
            player.tick();
            if (this.ballPossession === "none" && player.animation.name !== "kick") {
                const playerVector = new victor_1.default(player.position.x, player.position.y);
                const ballVector = new victor_1.default(this.ball.position.x, this.ball.position.y);
                const distance = ballVector.distance(playerVector);
                if (distance < this.settings.constraint.activateDistance) {
                    this.giveBallTo(player);
                }
            }
            if (player.animation.name === "tackle") {
                const playerVector = new victor_1.default(player.position.x, player.position.y);
                const ballVector = new victor_1.default(this.ball.position.x, this.ball.position.y);
                const distance = ballVector.distance(playerVector);
                // @todo: determine a random chance of getting the ball?
                //        if chance pass, give the ball to player
                if (distance < this.settings.tackle.distance) {
                    this.giveBallTo(player);
                }
            }
        });
        if (this.ballConstraint) {
            const player = this.players.get(this.ballPossession);
            if (!player) {
                this.resetPossession();
                return;
            }
            switch (player.direction) {
                case 2 /* Direction.N */:
                    this.ballConstraint.pointA.y = -this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = 0;
                    break;
                case 6 /* Direction.S */:
                    this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = 0;
                    break;
                case 0 /* Direction.E */:
                    this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = this.settings.constraint.offsetX;
                    break;
                case 4 /* Direction.W */:
                    this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = -this.settings.constraint.offsetX;
                    break;
                case 3 /* Direction.NW */:
                    this.ballConstraint.pointA.y = -this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = -this.settings.constraint.offsetX;
                    break;
                case 1 /* Direction.NE */:
                    this.ballConstraint.pointA.y = -this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = this.settings.constraint.offsetX;
                    break;
                case 7 /* Direction.SE */:
                    this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = this.settings.constraint.offsetX;
                    break;
                case 5 /* Direction.SW */:
                    this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
                    this.ballConstraint.pointA.x = -this.settings.constraint.offsetX;
                    break;
            }
        }
    }
    resetPossession() {
        this.ballPossession = "none";
        if (this.ballConstraint) {
            matter_js_1.World.remove(this.physics.world, this.ballConstraint, false);
            this.ballConstraint = undefined;
        }
    }
    giveBallTo(player) {
        this.resetPossession();
        this.ballPossession = player.id;
        this.ballConstraint = matter_js_1.Constraint.create({
            length: 0,
            stiffness: 1,
            bodyA: player.body,
            bodyB: this.ball.body,
            pointA: {
                x: this.settings.constraint.offsetX,
                y: this.settings.constraint.offsetY,
            },
        });
        matter_js_1.World.add(this.physics.world, this.ballConstraint);
    }
    createPlayer(sessionId, secondPlayer = false) {
        const player = new schemas_1.Player(sessionId, secondPlayer);
        this.players.set(sessionId, player);
        matter_js_1.World.add(this.physics.world, player.body);
        if (secondPlayer)
            this.start();
    }
    removePlayer(sessionId) {
        const player = this.players.get(sessionId);
        if (!player)
            return;
        matter_js_1.World.remove(this.physics.world, player.body);
        this.players.delete(sessionId);
        this.stop("PLAYER_LEFT" /* State.PLAYER_LEFT */);
    }
    playerMove(sessionId, input) {
        if (this.state === "END" /* State.END */ || this.state === "PLAYER_LEFT" /* State.PLAYER_LEFT */)
            return;
        const player = this.players.get(sessionId);
        if (!player)
            return;
        player.applyInput(input);
    }
    playerAction(sessionId) {
        if (this.state === "END" /* State.END */ || this.state === "PLAYER_LEFT" /* State.PLAYER_LEFT */)
            return;
        const player = this.players.get(sessionId);
        if (!player)
            return;
        if (this.ballPossession === player.id) {
            player.playAnimation("kick");
            this.resetPossession();
            this.ball.kick(player.direction);
        }
        else {
            player.playAnimation("tackle");
        }
    }
    changePlayerSettings(sessionId, settings) {
        const player = this.players.get(sessionId);
        if (!player)
            return;
        player.applySettings(settings);
    }
    changeBallSettings(settings) {
        this.ball.applySettings(settings);
    }
    changeMatchSettings(settings) {
        if (settings.constraint) {
            if (settings.constraint.activateDistance) {
                this.settings.constraint.activateDistance =
                    settings.constraint.activateDistance;
            }
            if (settings.constraint.offsetX) {
                this.settings.constraint.offsetX = settings.constraint.offsetX;
            }
            if (settings.constraint.offsetY) {
                this.settings.constraint.offsetY = settings.constraint.offsetY;
            }
        }
        if (settings.tackle) {
            if (settings.tackle.distance) {
                this.settings.tackle.distance = settings.tackle.distance;
            }
        }
    }
    resetPositions() {
        this.resetPossession();
        this.ball.reset();
        this.players.forEach((player) => player.reset());
    }
    score(side) {
        this.resetPositions();
        if (this.onScore)
            this.onScore(side);
        this.players.forEach((player) => {
            if (side === "right") {
                if (player.side === "left")
                    player.addScore();
            }
            if (side === "left") {
                if (player.side === "right")
                    player.addScore();
            }
            if (player.score === this.settings.match.maxScore) {
                this.end();
            }
        });
    }
    updateTimeRemaining() {
        const remaining = this.timer.getTimeLeft();
        const seconds = Math.floor((remaining / 1000) % 60).toLocaleString("en-US", { minimumIntegerDigits: 2 });
        const minutes = Math.floor((remaining / (60 * 1000)) % 60).toLocaleString("en-US", { minimumIntegerDigits: 2 });
        this.timeRemaining = `${minutes}:${seconds}`;
    }
    isBallOutOfBounds() {
        return (Math.abs(this.ball.position.x) > this.field.width ||
            Math.abs(this.ball.position.y) > this.field.height);
    }
}
exports.Match = Match;
(0, schema_1.defineTypes)(Match, {
    ball: schemas_1.Ball,
    field: schemas_1.Field,
    goalLeft: schemas_1.Goal,
    goalRight: schemas_1.Goal,
    state: "string",
    playing: "boolean",
    timeRemaining: "string",
    players: { map: schemas_1.Player },
    ballPossession: "string",
});
//# sourceMappingURL=State.js.map