import { Bodies, Body } from "matter-js";
import { Schema, defineTypes } from "@colyseus/schema";

import { Vector } from "../../schemas";
import { textureMap } from "../../utils";

export class Goal extends Schema {
  public body: any;

  constructor(side: "left" | "right") {
    super();

    this.width = textureMap.goal.width;
    this.height = textureMap.goal.height;

    this.position = new Vector(
      textureMap.fieldTile.width,
      textureMap.field.height / 2
    );

    if (side === "right") {
      this.position.x = textureMap.field.width - textureMap.fieldTile.width;
    }

    this.body = Bodies.rectangle(0, 0, this.width, this.height, {
      isSensor: true,
      isStatic: true,
      density: 1,
    });

    this.vertices = this.body.vertices.map(
      (each: any) => new Vector(each.x, each.y)
    );

    Body.setPosition(this.body, this.position);
  }
}

defineTypes(Goal, {
  width: "number",
  height: "number",
  position: Vector,
  vertices: [Vector],
});

export interface Goal extends Schema {
  width: number;
  height: number;
  position: Vector;
  vertices: Vector[];
}
