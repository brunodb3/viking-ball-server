import Victor from "victor";
import { MapSchema, Schema, defineTypes } from "@colyseus/schema";
import { Engine, Runner, World, Constraint, Collision } from "matter-js";

import { Direction, Timer } from "../../utils";
import {
  Player,
  PlayerSettings,
  Goal,
  Ball,
  Field,
  BallSettings,
  PlayerInput,
} from "../../schemas";

export interface MatchSettings {
  constraint?: {
    offsetX?: number;
    offsetY?: number;
    activateDistance?: number;
  };
  tackle?: {
    distance?: number;
  };
}

export const enum State {
  WAITING = "WAITING",
  IN_PROGRESS = "IN_PROGRESS",
  PLAYER_LEFT = "PLAYER_LEFT",
  END = "END",
}

export class Match extends Schema {
  public fps: number;
  public timer: Timer;
  public physics: any;
  public settings: {
    match: {
      length: number;
      maxScore: number;
    };
    constraint: {
      offsetX: number;
      offsetY: number;
      activateDistance: number;
    };
    tackle: {
      distance: number;
    };
  };

  public ballConstraint?: any;

  public onStart?: () => void;
  public onEnd?: (winner: string, tie: boolean) => void;
  public onScore?: (side: "left" | "right") => void;

  constructor(options?: {
    onStart?: () => void;
    onEnd?: (winner: string, tie: boolean) => void;
    onScore?: (side: "left" | "right") => void;
  }) {
    super();

    this.fps = 20;
    this.playing = false;
    this.state = State.WAITING;
    this.ballPossession = "none";
    this.settings = {
      match: {
        // ? Match length is in milliseconds
        length: 1 * 1000 * 60,
        maxScore: 5,
      },
      constraint: {
        offsetX: 25,
        offsetY: 20,
        activateDistance: 60,
      },
      tackle: {
        distance: 60,
      },
    };

    this.onEnd = options?.onEnd;
    this.onStart = options?.onStart;
    this.onScore = options?.onScore;

    this.ball = new Ball();
    this.field = new Field();
    this.goalLeft = new Goal("left");
    this.goalRight = new Goal("right");
    this.players = new MapSchema<Player>();

    this.physics = Engine.create();
    this.physics.gravity.y = 0;

    World.add(this.physics.world, [
      this.field.body,
      this.ball.body,
      this.goalLeft.body,
      this.goalRight.body,
    ]);

    const runner = Runner.create({ isFixed: true });
    Runner.start(runner, this.physics);

    setInterval(this.tick.bind(this), 1000 / this.fps);
    this.timer = new Timer(this.end.bind(this), this.settings.match.length);
  }

  public start(): void {
    this.resetPositions();
    this.timer.start();

    this.playing = true;
    this.state = State.IN_PROGRESS;

    if (this.onStart) this.onStart();
  }

  public stop(state?: State): void {
    this.resetPositions();
    this.timer.reset();

    this.playing = false;
    this.state = state || State.WAITING;
  }

  public end(): void {
    this.resetPositions();
    this.timer.stop();

    this.playing = false;
    this.state = State.END;

    let tie = false;
    let winner = {
      id: "",
      score: 0,
    };

    this.players.forEach((player) => {
      if (player.score === winner.score) {
        tie = true;
      } else {
        tie = false;
      }

      if (player.score === 0) return;

      if (player.score > winner.score) {
        winner = {
          id: player.id,
          score: player.score,
        };
      }
    });

    if (this.onEnd) this.onEnd(winner.id, tie);
  }

  public tick(): void {
    this.ball.tick();
    this.updateTimeRemaining();

    if (this.isBallOutOfBounds()) {
      this.ball.reset();
    }

    if (this.state === State.IN_PROGRESS) {
      if (Collision.collides(this.ball.body, this.goalLeft.body) != null) {
        this.score("left");
      }

      if (Collision.collides(this.ball.body, this.goalRight.body) != null) {
        this.score("right");
      }
    }

    this.players.forEach((player) => {
      player.tick();

      if (this.ballPossession === "none" && player.animation.name !== "kick") {
        const playerVector = new Victor(player.position.x, player.position.y);
        const ballVector = new Victor(
          this.ball.position.x,
          this.ball.position.y
        );

        const distance = ballVector.distance(playerVector);

        if (distance < this.settings.constraint.activateDistance) {
          this.giveBallTo(player);
        }
      }

      if (player.animation.name === "tackle") {
        const playerVector = new Victor(player.position.x, player.position.y);
        const ballVector = new Victor(
          this.ball.position.x,
          this.ball.position.y
        );

        const distance = ballVector.distance(playerVector);

        // @todo: determine a random chance of getting the ball?
        //        if chance pass, give the ball to player
        if (distance < this.settings.tackle.distance) {
          this.giveBallTo(player);
        }
      }
    });

    if (this.ballConstraint) {
      const player = this.players.get(this.ballPossession);
      if (!player) {
        this.resetPossession();
        return;
      }

      switch (player.direction) {
        case Direction.N:
          this.ballConstraint.pointA.y = -this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = 0;
          break;
        case Direction.S:
          this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = 0;
          break;
        case Direction.E:
          this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = this.settings.constraint.offsetX;
          break;
        case Direction.W:
          this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = -this.settings.constraint.offsetX;
          break;
        case Direction.NW:
          this.ballConstraint.pointA.y = -this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = -this.settings.constraint.offsetX;
          break;
        case Direction.NE:
          this.ballConstraint.pointA.y = -this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = this.settings.constraint.offsetX;
          break;
        case Direction.SE:
          this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = this.settings.constraint.offsetX;
          break;
        case Direction.SW:
          this.ballConstraint.pointA.y = this.settings.constraint.offsetY;
          this.ballConstraint.pointA.x = -this.settings.constraint.offsetX;
          break;
      }
    }
  }

  public resetPossession(): void {
    this.ballPossession = "none";

    if (this.ballConstraint) {
      World.remove(this.physics.world, this.ballConstraint, false);
      this.ballConstraint = undefined;
    }
  }

  public giveBallTo(player: Player): void {
    this.resetPossession();
    this.ballPossession = player.id;
    this.ballConstraint = Constraint.create({
      length: 0,
      stiffness: 1,
      bodyA: player.body,
      bodyB: this.ball.body,
      pointA: {
        x: this.settings.constraint.offsetX,
        y: this.settings.constraint.offsetY,
      },
    });

    World.add(this.physics.world, this.ballConstraint);
  }

  public createPlayer(sessionId: string, secondPlayer: boolean = false): void {
    const player = new Player(sessionId, secondPlayer);

    this.players.set(sessionId, player);
    World.add(this.physics.world, player.body);

    if (secondPlayer) this.start();
  }

  public removePlayer(sessionId: string): void {
    const player = this.players.get(sessionId);
    if (!player) return;

    World.remove(this.physics.world, player.body);
    this.players.delete(sessionId);

    this.stop(State.PLAYER_LEFT);
  }

  public playerMove(sessionId: string, input: PlayerInput): void {
    if (this.state === State.END || this.state === State.PLAYER_LEFT) return;

    const player = this.players.get(sessionId);
    if (!player) return;

    player.applyInput(input);
  }

  public playerAction(sessionId: string): void {
    if (this.state === State.END || this.state === State.PLAYER_LEFT) return;

    const player = this.players.get(sessionId);
    if (!player) return;

    if (this.ballPossession === player.id) {
      player.playAnimation("kick");

      this.resetPossession();
      this.ball.kick(player.direction);
    } else {
      player.playAnimation("tackle");
    }
  }

  public changePlayerSettings(
    sessionId: string,
    settings: PlayerSettings
  ): void {
    const player = this.players.get(sessionId);
    if (!player) return;

    player.applySettings(settings);
  }

  public changeBallSettings(settings: BallSettings): void {
    this.ball.applySettings(settings);
  }

  public changeMatchSettings(settings: MatchSettings): void {
    if (settings.constraint) {
      if (settings.constraint.activateDistance) {
        this.settings.constraint.activateDistance =
          settings.constraint.activateDistance;
      }

      if (settings.constraint.offsetX) {
        this.settings.constraint.offsetX = settings.constraint.offsetX;
      }

      if (settings.constraint.offsetY) {
        this.settings.constraint.offsetY = settings.constraint.offsetY;
      }
    }

    if (settings.tackle) {
      if (settings.tackle.distance) {
        this.settings.tackle.distance = settings.tackle.distance;
      }
    }
  }

  public resetPositions(): void {
    this.resetPossession();

    this.ball.reset();
    this.players.forEach((player) => player.reset());
  }

  public score(side: "left" | "right"): void {
    this.resetPositions();

    if (this.onScore) this.onScore(side);

    this.players.forEach((player) => {
      if (side === "right") {
        if (player.side === "left") player.addScore();
      }

      if (side === "left") {
        if (player.side === "right") player.addScore();
      }

      if (player.score === this.settings.match.maxScore) {
        this.end();
      }
    });
  }

  private updateTimeRemaining(): void {
    const remaining = this.timer.getTimeLeft();
    const seconds = Math.floor((remaining / 1000) % 60).toLocaleString(
      "en-US",
      { minimumIntegerDigits: 2 }
    );
    const minutes = Math.floor((remaining / (60 * 1000)) % 60).toLocaleString(
      "en-US",
      { minimumIntegerDigits: 2 }
    );

    this.timeRemaining = `${minutes}:${seconds}`;
  }

  private isBallOutOfBounds(): boolean {
    return (
      Math.abs(this.ball.position.x) > this.field.width ||
      Math.abs(this.ball.position.y) > this.field.height
    );
  }

  // private onCollision(event: any): void {
  //   const pair = event.pairs[0];

  //   if (this.playing) this.checkForScore(pair);
  // }

  // private checkForScore(pair: any): void {
  //   if (
  //     (pair.bodyA.id === this.goalLeft.body.id ||
  //       pair.bodyB.id === this.goalLeft.body.id) &&
  //     (pair.bodyA.id === this.ball.body.id ||
  //       pair.bodyB.id === this.ball.body.id)
  //   ) {
  //     console.log("SCORE LEFT");
  //     if (this.onScore) this.onScore("left");
  //   }

  //   if (
  //     (pair.bodyA.id === this.goalRight.body.id ||
  //       pair.bodyB.id === this.goalRight.body.id) &&
  //     (pair.bodyA.id === this.ball.body.id ||
  //       pair.bodyB.id === this.ball.body.id)
  //   ) {
  //     console.log("SCORE RIGHT");
  //     if (this.onScore) this.onScore("right");
  //   }
  // }
}

defineTypes(Match, {
  ball: Ball,
  field: Field,
  goalLeft: Goal,
  goalRight: Goal,
  state: "string",
  playing: "boolean",
  timeRemaining: "string",
  players: { map: Player },
  ballPossession: "string",
});

export interface Match extends Schema {
  ball: Ball;
  field: Field;
  goalLeft: Goal;
  goalRight: Goal;
  state: State;
  playing: boolean;
  timeRemaining: string;
  ballPossession: string;
  players: MapSchema<Player>;
}
