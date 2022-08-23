import { Schema, defineTypes } from "@colyseus/schema";

export class Vector extends Schema {
  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }
}

defineTypes(Vector, {
  x: "number",
  y: "number",
});

export interface Vector extends Schema {
  x: number;
  y: number;
}

// -----------------------------------------------------------------------------

export class Rectangle extends Schema {
  constructor(x: number, y: number, width: number, height: number) {
    super();

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

defineTypes(Rectangle, {
  x: "number",
  y: "number",
  width: "number",
  height: "number",
});

export interface Rectangle extends Schema {
  x: number;
  y: number;
  width: number;
  height: number;
}
// -----------------------------------------------------------------------------

export class Box extends Schema {
  constructor(
    top: Rectangle,
    bottom: Rectangle,
    left: Rectangle,
    right: Rectangle
  ) {
    super();

    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
  }
}

defineTypes(Box, {
  top: Rectangle,
  bottom: Rectangle,
  left: Rectangle,
  right: Rectangle,
});

export interface Box extends Schema {
  top: Rectangle;
  bottom: Rectangle;
  left: Rectangle;
  right: Rectangle;
}

// -----------------------------------------------------------------------------

export class Animation extends Schema {
  constructor() {
    super();

    this.speed = 0;
    this.name = "idle";
    this.blocking = false;
  }
}

defineTypes(Animation, {
  name: "string",
  speed: "number",
  blocking: "boolean",
});

export interface Animation extends Schema {
  name: string;
  speed: number;
  blocking: boolean;
}

// -----------------------------------------------------------------------------
