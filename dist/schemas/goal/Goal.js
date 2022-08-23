"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const matter_js_1 = require("matter-js");
const schema_1 = require("@colyseus/schema");
const schemas_1 = require("../../schemas");
const utils_1 = require("../../utils");
class Goal extends schema_1.Schema {
    constructor(side) {
        super();
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.width = utils_1.textureMap.goal.width;
        this.height = utils_1.textureMap.goal.height;
        this.position = new schemas_1.Vector(utils_1.textureMap.fieldTile.width, utils_1.textureMap.field.height / 2);
        if (side === "right") {
            this.position.x = utils_1.textureMap.field.width - utils_1.textureMap.fieldTile.width;
        }
        this.body = matter_js_1.Bodies.rectangle(0, 0, this.width, this.height, {
            isSensor: true,
            isStatic: true,
            density: 1,
        });
        this.vertices = this.body.vertices.map((each) => new schemas_1.Vector(each.x, each.y));
        matter_js_1.Body.setPosition(this.body, this.position);
    }
}
exports.Goal = Goal;
(0, schema_1.defineTypes)(Goal, {
    width: "number",
    height: "number",
    position: schemas_1.Vector,
    vertices: [schemas_1.Vector],
});
//# sourceMappingURL=Goal.js.map