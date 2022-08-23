import { Bodies, Body } from "matter-js";
import { Schema, defineTypes } from "@colyseus/schema";

import { textureMap } from "../../utils";
import { Vector, Rectangle, Box } from "../../schemas";

export class Field extends Schema {
  public body: any;
  public width: number;
  public height: number;

  constructor() {
    super();

    this.position = new Vector(0, 0);
    this.width = textureMap.field.width;
    this.height = textureMap.field.height;
    this.center = new Vector(this.width / 2, this.height / 2);

    const walls = new Box(
      new Rectangle(this.center.x, -10, this.width, 20),
      new Rectangle(this.center.x, this.height + 10, this.width, 20),
      new Rectangle(-10, this.center.y, 20, this.height),
      new Rectangle(this.width + 10, this.center.y, 20, this.height)
    );

    const parts = {
      top: Bodies.rectangle(
        walls.top.x,
        walls.top.y,
        walls.top.width,
        walls.top.height,
        {
          isStatic: true,
        }
      ),
      bottom: Bodies.rectangle(
        walls.bottom.x,
        walls.bottom.y,
        walls.bottom.width,
        walls.bottom.height,
        {
          isStatic: true,
        }
      ),
      left: Bodies.rectangle(
        walls.left.x,
        walls.left.y,
        walls.left.width,
        walls.left.height,
        {
          isStatic: true,
        }
      ),
      right: Bodies.rectangle(
        walls.right.x,
        walls.right.y,
        walls.right.width,
        walls.right.height,
        {
          isStatic: true,
        }
      ),
    };

    this.body = Body.create({
      isStatic: true,
      parts: [parts.top, parts.bottom, parts.left, parts.right],
    });

    this.vertices = this.body.vertices.map(
      (each: any) => new Vector(each.x, each.y)
    );
  }
}

defineTypes(Field, {
  center: Vector,
  position: Vector,
  vertices: [Vector],
});

export interface Field extends Schema {
  center: Vector;
  position: Vector;
  vertices: Vector[];
}
