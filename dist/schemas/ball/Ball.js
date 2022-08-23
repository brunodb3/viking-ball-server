"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
const victor_1 = __importDefault(require("victor"));
const matter_js_1 = require("matter-js");
const schema_1 = require("@colyseus/schema");
const schemas_1 = require("../../schemas");
const utils_1 = require("../../utils");
class Ball extends schema_1.Schema {
    constructor() {
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
        this.width = utils_1.textureMap.ball.width;
        this.height = utils_1.textureMap.ball.height;
        this.settings = {
            kickForce: 5,
            forceMagnitude: 0.0008,
        };
        this.initialPosition = new schemas_1.Vector(utils_1.textureMap.field.width / 2, utils_1.textureMap.field.height / 2);
        this.velocity = new schemas_1.Vector(0, 0);
        this.position = new schemas_1.Vector(this.initialPosition.x, this.initialPosition.y);
        this.body = matter_js_1.Bodies.circle(0, 0, this.width / 2, 
        // @todo: add these to settings?
        { density: 0.5, frictionAir: 0.05, restitution: 0.8 });
        this.vertices = this.body.vertices.map((each) => new schemas_1.Vector(each.x, each.y));
        this.body.collisionFilter.group = -1;
        this.reset();
    }
    tick() {
        this.position.x = this.body.position.x;
        this.position.y = this.body.position.y;
        this.velocity.x = this.body.velocity.x;
        this.velocity.y = this.body.velocity.y;
    }
    reset() {
        matter_js_1.Body.setVelocity(this.body, { x: 0, y: 0 });
        matter_js_1.Body.setPosition(this.body, this.initialPosition);
    }
    kick(direction) {
        switch (direction) {
            case 2 /* Direction.N */:
                this.addForce({ x: 0, y: -this.settings.kickForce });
                break;
            case 6 /* Direction.S */:
                this.addForce({ x: 0, y: this.settings.kickForce });
                break;
            case 0 /* Direction.E */:
                this.addForce({ x: this.settings.kickForce, y: 0 });
                break;
            case 4 /* Direction.W */:
                this.addForce({ x: -this.settings.kickForce, y: 0 });
                break;
            case 3 /* Direction.NW */:
                this.addForce({
                    x: -this.settings.kickForce,
                    y: -this.settings.kickForce,
                });
                break;
            case 1 /* Direction.NE */:
                this.addForce({
                    x: this.settings.kickForce,
                    y: -this.settings.kickForce,
                });
                break;
            case 7 /* Direction.SE */:
                this.addForce({
                    x: this.settings.kickForce,
                    y: this.settings.kickForce,
                });
                break;
            case 5 /* Direction.SW */:
                this.addForce({
                    x: -this.settings.kickForce,
                    y: this.settings.kickForce,
                });
                break;
        }
    }
    addForce(force) {
        // ? Pixi inverts Y axis
        const forceVector = new victor_1.default(force.x, -force.y);
        forceVector.multiplyScalar(this.body.mass);
        forceVector.multiplyScalar(this.settings.forceMagnitude);
        matter_js_1.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, force);
    }
    applySettings(settings) {
        if (settings.kickForce) {
            this.settings.kickForce = settings.kickForce;
        }
        if (settings.forceMagnitude) {
            this.settings.forceMagnitude = settings.forceMagnitude;
        }
    }
}
exports.Ball = Ball;
(0, schema_1.defineTypes)(Ball, {
    width: "number",
    height: "number",
    position: schemas_1.Vector,
    velocity: schemas_1.Vector,
    vertices: [schemas_1.Vector],
});
//# sourceMappingURL=Ball.js.map