import Victor from "victor";
import { Bodies, Body } from "matter-js";
import { Schema, defineTypes } from "@colyseus/schema";

import {
  Direction,
  DirectionVectors,
  IndexesToDirections,
  textureMap,
} from "../../utils";
import { Animation, Vector } from "../../schemas";

export interface PlayerInput {
  running: boolean;
  force: { x: number; y: number };
}

export interface PlayerSettings {
  forceMagnitude?: number;
  velocityThreshold?: number;
  runningMultiplier?: number;
  animations?: {
    run?: {
      multiplier?: number;
    };
    idle?: {
      multiplier?: number;
    };
    kick?: {
      duration?: number;
      multiplier?: number;
    };
    tackle?: {
      duration?: number;
      multiplier?: number;
    };
  };
}

export class Player extends Schema {
  public body: any;
  public initialPosition: Vector;
  public settings: {
    forceMagnitude: number;
    velocityThreshold: number;
    runningMultiplier: number;
    animations: {
      run: {
        multiplier: number;
      };
      idle: {
        multiplier: number;
      };
      kick: {
        duration: number;
        multiplier: number;
      };
      tackle: {
        duration: number;
        multiplier: number;
      };
    };
  };

  constructor(id: string, secondPlayer: boolean = false) {
    super();

    const offsetX = textureMap.fieldTile.width;
    const y = textureMap.field.height / 2;
    const x = secondPlayer
      ? textureMap.field.width - textureMap.fieldTile.width - offsetX
      : textureMap.fieldTile.width + offsetX;

    this.id = id;
    this.score = 0;
    this.direction = Direction.E;
    this.width = textureMap.player.width;
    this.height = textureMap.player.height;
    this.side = secondPlayer ? "right" : "left";

    this.animation = new Animation();
    this.velocity = new Vector(0, 0);
    this.initialPosition = new Vector(x, y);
    this.position = new Vector(this.initialPosition.x, this.initialPosition.y);

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

    this.body = Bodies.rectangle(0, 0, this.width, this.height, {
      density: 10,
      frictionAir: 0.1,
    });

    this.vertices = this.body.vertices.map(
      (each: any) => new Vector(each.x, each.y)
    );

    // ? Bodies will still collide with each other if the collision group is
    // positive, which is why we set it to a negative number for players
    this.body.collisionFilter.group = -1;

    this.reset();
  }

  public tick(): void {
    // @todo: should proceed if animation blocking?
    // if (this.animation.blocking) return;

    const velocity = new Victor(this.body.velocity.x, this.body.velocity.y);

    if (Math.abs(velocity.x) < this.settings.velocityThreshold) {
      velocity.x = 0;
    }

    if (Math.abs(velocity.y) < this.settings.velocityThreshold) {
      velocity.y = 0;
    }

    if (velocity.length() > 0) {
      const dots = Array.from({ length: 8 }, (_, index) => {
        const direction = new Victor(velocity.x, velocity.y);
        return direction
          .normalize()
          .dot(DirectionVectors[IndexesToDirections[index]]);
      });

      const max = Math.max(...dots);
      const maxIndex = dots.indexOf(max);

      this.direction = maxIndex;
    }

    this.velocity.x = velocity.x;
    this.velocity.y = velocity.y;
    this.position.x = this.body.position.x;
    this.position.y = this.body.position.y;

    if (this.animation.blocking) return;

    if (velocity.length() === 0) {
      this.playAnimation("idle");
    } else {
      this.playAnimation("run");
    }
  }

  // @todo: play animation should to send a message to client instead?
  // "Player X played animation Y"
  public playAnimation(name: "idle" | "run" | "kick" | "tackle"): void {
    switch (name) {
      case "idle":
        this.animation.name = "idle";
        this.animation.blocking = false;
        this.animation.speed = this.settings.animations.idle.multiplier;
        break;
      case "run":
        const velocity = new Victor(this.body.velocity.x, this.body.velocity.y);

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
        setTimeout(
          () => this.playAnimation("idle"),
          this.settings.animations.kick.duration
        );
        break;
      case "tackle":
        this.animation.name = "tackle";
        this.animation.blocking = true;
        this.animation.speed = this.settings.animations.tackle.multiplier;

        // @todo: set timeout based on framecount, not time?
        setTimeout(
          () => this.playAnimation("idle"),
          this.settings.animations.tackle.duration
        );
        break;
    }
  }

  public applyInput(input: PlayerInput): void {
    // @todo: should proceed if animation blocking?
    // if (this.animation.blocking) return;

    // @todo: input validation (don't trust what client sends as input force)
    //        cap the force to maximum of 1 and minimum of -1 for X and Y

    // ? Pixi and MatterJS have inverted Y axis
    const force = new Victor(input.force.x, -input.force.y);

    if (input.running) force.multiplyScalar(this.settings.runningMultiplier);

    force.multiplyScalar(this.body.mass);
    force.multiplyScalar(this.settings.forceMagnitude);

    Body.applyForce(
      this.body,
      { x: this.body.position.x, y: this.body.position.y },
      force
    );
  }

  public applySettings(settings: PlayerSettings): void {
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

  public reset(): void {
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setPosition(this.body, this.initialPosition);

    // ? If player is on the right side, they need to face west
    this.direction = this.side === "right" ? Direction.W : Direction.E;
  }

  public addScore(): void {
    this.score++;
  }
}

defineTypes(Player, {
  id: "string",
  side: "string",
  score: "number",
  width: "number",
  height: "number",
  direction: "number",
  position: Vector,
  velocity: Vector,
  vertices: [Vector],
  animation: Animation,
});

export interface Player extends Schema {
  id: string;
  side: string;
  score: number;
  width: number;
  height: number;
  direction: number;
  position: Vector;
  velocity: Vector;
  vertices: Vector[];
  animation: Animation;
}
