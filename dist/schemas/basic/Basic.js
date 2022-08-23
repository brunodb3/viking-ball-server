"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animation = exports.Box = exports.Rectangle = exports.Vector = void 0;
const schema_1 = require("@colyseus/schema");
class Vector extends schema_1.Schema {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
}
exports.Vector = Vector;
(0, schema_1.defineTypes)(Vector, {
    x: "number",
    y: "number",
});
// -----------------------------------------------------------------------------
class Rectangle extends schema_1.Schema {
    constructor(x, y, width, height) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
exports.Rectangle = Rectangle;
(0, schema_1.defineTypes)(Rectangle, {
    x: "number",
    y: "number",
    width: "number",
    height: "number",
});
// -----------------------------------------------------------------------------
class Box extends schema_1.Schema {
    constructor(top, bottom, left, right) {
        super();
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }
}
exports.Box = Box;
(0, schema_1.defineTypes)(Box, {
    top: Rectangle,
    bottom: Rectangle,
    left: Rectangle,
    right: Rectangle,
});
// -----------------------------------------------------------------------------
class Animation extends schema_1.Schema {
    constructor() {
        super();
        this.speed = 0;
        this.name = "idle";
        this.blocking = false;
    }
}
exports.Animation = Animation;
(0, schema_1.defineTypes)(Animation, {
    name: "string",
    speed: "number",
    blocking: "boolean",
});
// -----------------------------------------------------------------------------
//# sourceMappingURL=Basic.js.map