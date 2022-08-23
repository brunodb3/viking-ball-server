import Victor from "victor";
import { Bodies, Body } from "matter-js";
import { Schema, defineTypes } from "@colyseus/schema";

import { Vector } from "@schemas";
import { Direction, textureMap } from "@utils";

export interface BallSettings {
  kickForce?: number;
  forceMagnitude?: number;
}

export class Ball extends Schema {
  public body: any;
  public initialPosition: Vector;
  public settings: {
    kickForce: number;
    forceMagnitude: number;
  };

  constructor() {
    super();

    this.width = textureMap.ball.width;
    this.height = textureMap.ball.height;

    this.settings = {
      kickForce: 5,
      forceMagnitude: 0.0008,
    };

    this.initialPosition = new Vector(
      textureMap.field.width / 2,
      textureMap.field.height / 2
    );

    this.velocity = new Vector(0, 0);
    this.position = new Vector(this.initialPosition.x, this.initialPosition.y);

    this.body = Bodies.circle(
      0,
      0,
      this.width / 2,
      // @todo: add these to settings?
      { density: 0.5, frictionAir: 0.05, restitution: 0.8 }
    );

    this.vertices = this.body.vertices.map(
      (each: any) => new Vector(each.x, each.y)
    );

    this.body.collisionFilter.group = -1;

    this.reset();
  }

  public tick(): void {
    this.position.x = this.body.position.x;
    this.position.y = this.body.position.y;

    this.velocity.x = this.body.velocity.x;
    this.velocity.y = this.body.velocity.y;
  }

  public reset(): void {
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setPosition(this.body, this.initialPosition);
  }

  public kick(direction: Direction): void {
    switch (direction) {
      case Direction.N:
        this.addForce({ x: 0, y: -this.settings.kickForce });
        break;
      case Direction.S:
        this.addForce({ x: 0, y: this.settings.kickForce });
        break;
      case Direction.E:
        this.addForce({ x: this.settings.kickForce, y: 0 });
        break;
      case Direction.W:
        this.addForce({ x: -this.settings.kickForce, y: 0 });
        break;
      case Direction.NW:
        this.addForce({
          x: -this.settings.kickForce,
          y: -this.settings.kickForce,
        });
        break;
      case Direction.NE:
        this.addForce({
          x: this.settings.kickForce,
          y: -this.settings.kickForce,
        });
        break;
      case Direction.SE:
        this.addForce({
          x: this.settings.kickForce,
          y: this.settings.kickForce,
        });
        break;
      case Direction.SW:
        this.addForce({
          x: -this.settings.kickForce,
          y: this.settings.kickForce,
        });
        break;
    }
  }

  public addForce(force: { x: number; y: number }): void {
    // ? Pixi inverts Y axis
    const forceVector = new Victor(force.x, -force.y);

    forceVector.multiplyScalar(this.body.mass);
    forceVector.multiplyScalar(this.settings.forceMagnitude);

    Body.applyForce(
      this.body,
      { x: this.body.position.x, y: this.body.position.y },
      force
    );
  }

  public applySettings(settings: BallSettings): void {
    if (settings.kickForce) {
      this.settings.kickForce = settings.kickForce;
    }

    if (settings.forceMagnitude) {
      this.settings.forceMagnitude = settings.forceMagnitude;
    }
  }
}

defineTypes(Ball, {
  width: "number",
  height: "number",
  position: Vector,
  velocity: Vector,
  vertices: [Vector],
});

export interface Ball extends Schema {
  width: number;
  height: number;
  position: Vector;
  velocity: Vector;
  vertices: Vector[];
}
