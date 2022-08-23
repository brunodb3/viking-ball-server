"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
const matter_js_1 = require("matter-js");
const schema_1 = require("@colyseus/schema");
const utils_1 = require("../../utils");
const schemas_1 = require("../../schemas");
class Field extends schema_1.Schema {
    constructor() {
        super();
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.position = new schemas_1.Vector(0, 0);
        this.width = utils_1.textureMap.field.width;
        this.height = utils_1.textureMap.field.height;
        this.center = new schemas_1.Vector(this.width / 2, this.height / 2);
        const walls = new schemas_1.Box(new schemas_1.Rectangle(this.center.x, -10, this.width, 20), new schemas_1.Rectangle(this.center.x, this.height + 10, this.width, 20), new schemas_1.Rectangle(-10, this.center.y, 20, this.height), new schemas_1.Rectangle(this.width + 10, this.center.y, 20, this.height));
        const parts = {
            top: matter_js_1.Bodies.rectangle(walls.top.x, walls.top.y, walls.top.width, walls.top.height, {
                isStatic: true,
            }),
            bottom: matter_js_1.Bodies.rectangle(walls.bottom.x, walls.bottom.y, walls.bottom.width, walls.bottom.height, {
                isStatic: true,
            }),
            left: matter_js_1.Bodies.rectangle(walls.left.x, walls.left.y, walls.left.width, walls.left.height, {
                isStatic: true,
            }),
            right: matter_js_1.Bodies.rectangle(walls.right.x, walls.right.y, walls.right.width, walls.right.height, {
                isStatic: true,
            }),
        };
        this.body = matter_js_1.Body.create({
            isStatic: true,
            parts: [parts.top, parts.bottom, parts.left, parts.right],
        });
        this.vertices = this.body.vertices.map((each) => new schemas_1.Vector(each.x, each.y));
    }
}
exports.Field = Field;
(0, schema_1.defineTypes)(Field, {
    center: schemas_1.Vector,
    position: schemas_1.Vector,
    vertices: [schemas_1.Vector],
});
//# sourceMappingURL=Field.js.map