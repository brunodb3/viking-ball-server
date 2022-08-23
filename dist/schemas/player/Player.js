"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const victor_1 = __importDefault(require("victor"));
const matter_js_1 = require("matter-js");
const schema_1 = require("@colyseus/schema");
const utils_1 = require("../../utils");
const schemas_1 = require("../../schemas");
class Player extends schema_1.Schema {
    constructor(id, secondPlayer = false) {
        super();
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initialPosition", {
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
        const offsetX = utils_1.textureMap.fieldTile.width;
        const y = utils_1.textureMap.field.height / 2;
        const x = secondPlayer
            ? utils_1.textureMap.field.width - utils_1.textureMap.fieldTile.width - offsetX
            : utils_1.textureMap.fieldTile.width + offsetX;
        this.id = id;
        this.score = 0;
        this.direction = 0 /* Direction.E */;
        this.width = utils_1.textureMap.player.width;
        this.height = utils_1.textureMap.player.height;
        this.side = secondPlayer ? "right" : "left";
        this.animation = new schemas_1.Animation();
        this.velocity = new schemas_1.Vector(0, 0);
        this.initialPosition = new schemas_1.Vector(x, y);
        this.position = new schemas_1.Vector(this.initialPosition.x, this.initialPosition.y);
        this.settings = {
            forceMagnitude: 0.0008,
            runningMultiplier: 1.5,
            velocityThreshold: 0.01,
            animations: {
                run: {
                    multiplier: 0.08,
                },
                idle: {
                    multiplier: 0.15,
                },
                kick: {
                    duration: 1000,
                    multiplier: 0.15,
                },
                tackle: {
                    duration: 1000,
                    multiplier: 0.15,
                },
            },
        };
        this.body = matter_js_1.Bodies.rectangle(0, 0, this.width, this.height, {
            density: 10,
            frictionAir: 0.1,
        });
        this.vertices = this.body.vertices.map((each) => new schemas_1.Vector(each.x, each.y));
        // ? Bodies will still collide with each other if the collision group is
        // positive, which is why we set it to a negative number for players
        this.body.collisionFilter.group = -1;
        this.reset();
    }
    tick() {
        // @todo: should proceed if animation blocking?
        // if (this.animation.blocking) return;
        const velocity = new victor_1.default(this.body.velocity.x, this.body.velocity.y);
        if (Math.abs(velocity.x) < this.settings.velocityThreshold) {
            velocity.x = 0;
        }
        if (Math.abs(velocity.y) < this.settings.velocityThreshold) {
            velocity.y = 0;
        }
        if (velocity.length() > 0) {
            const dots = Array.from({ length: 8 }, (_, index) => {
                const direction = new victor_1.default(velocity.x, velocity.y);
                return direction
                    .normalize()
                    .dot(utils_1.DirectionVectors[utils_1.IndexesToDirections[index]]);
            });
            const max = Math.max(...dots);
            const maxIndex = dots.indexOf(max);
            this.direction = maxIndex;
        }
        this.velocity.x = velocity.x;
        this.velocity.y = velocity.y;
        this.position.x = this.body.position.x;
        this.position.y = this.body.position.y;
        if (this.animation.blocking)
            return;
        if (velocity.length() === 0) {
            this.playAnimation("idle");
        }
        else {
            this.playAnimation("run");
        }
    }
    // @todo: play animation should to send a message to client instead?
    // "Player X played animation Y"
    playAnimation(name) {
        switch (name) {
            case "idle":
                this.animation.name = "idle";
                this.animation.blocking = false;
                this.animation.speed = this.settings.animations.idle.multiplier;
                break;
            case "run":
                const velocity = new victor_1.default(this.body.velocity.x, this.body.velocity.y);
                this.animation.name = "run";
                this.animation.blocking = false;
                this.animation.speed =
                    velocity.length() * this.settings.animations.run.multiplier;
                break;
            case "kick":
                this.animation.name = "kick";
                this.animation.blocking = true;
                this.animation.speed = this.settings.animations.kick.multiplier;
                // @todo: set timeout based on framecount, not time?
                setTimeout(() => this.playAnimation("idle"), this.settings.animations.kick.duration);
                break;
            case "tackle":
                this.animation.name = "tackle";
                this.animation.blocking = true;
                this.animation.speed = this.settings.animations.tackle.multiplier;
                // @todo: set timeout based on framecount, not time?
                setTimeout(() => this.playAnimation("idle"), this.settings.animations.tackle.duration);
                break;
        }
    }
    applyInput(input) {
        // @todo: should proceed if animation blocking?
        // if (this.animation.blocking) return;
        // @todo: input validation (don't trust what client sends as input force)
        //        cap the force to maximum of 1 and minimum of -1 for X and Y
        // ? Pixi and MatterJS have inverted Y axis
        const force = new victor_1.default(input.force.x, -input.force.y);
        if (input.running)
            force.multiplyScalar(this.settings.runningMultiplier);
        force.multiplyScalar(this.body.mass);
        force.multiplyScalar(this.settings.forceMagnitude);
        matter_js_1.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, force);
    }
    applySettings(settings) {
        if (settings.forceMagnitude) {
            this.settings.forceMagnitude = settings.forceMagnitude;
        }
        if (settings.velocityThreshold) {
            this.settings.velocityThreshold = settings.velocityThreshold;
        }
        if (settings.runningMultiplier) {
            this.settings.runningMultiplier = settings.runningMultiplier;
        }
        if (settings.animations) {
            if (settings.animations.run) {
                if (settings.animations.run.multiplier) {
                    this.settings.animations.run.multiplier =
                        settings.animations.run.multiplier;
                }
            }
            if (settings.animations.idle) {
                if (settings.animations.idle.multiplier) {
                    this.settings.animations.idle.multiplier =
                        settings.animations.idle.multiplier;
                }
            }
            if (settings.animations.kick) {
                if (settings.animations.kick.duration) {
                    this.settings.animations.kick.duration =
                        settings.animations.kick.duration;
                }
                if (settings.animations.kick.multiplier) {
                    this.settings.animations.kick.multiplier =
                        settings.animations.kick.multiplier;
                }
            }
            if (settings.animations.tackle) {
                if (settings.animations.tackle.duration) {
                    this.settings.animations.tackle.duration =
                        settings.animations.tackle.duration;
                }
                if (settings.animations.tackle.multiplier) {
                    this.settings.animations.tackle.multiplier =
                        settings.animations.tackle.multiplier;
                }
            }
        }
    }
    reset() {
        matter_js_1.Body.setVelocity(this.body, { x: 0, y: 0 });
        matter_js_1.Body.setPosition(this.body, this.initialPosition);
        // ? If player is on the right side, they need to face west
        this.direction = this.side === "right" ? 4 /* Direction.W */ : 0 /* Direction.E */;
    }
    addScore() {
        this.score++;
    }
}
exports.Player = Player;
(0, schema_1.defineTypes)(Player, {
    id: "string",
    side: "string",
    score: "number",
    width: "number",
    height: "number",
    direction: "number",
    position: schemas_1.Vector,
    velocity: schemas_1.Vector,
    vertices: [schemas_1.Vector],
    animation: schemas_1.Animation,
});
//# sourceMappingURL=Player.js.map