import { Room, Client } from "colyseus";

import { Logger } from "../../utils";
import { Match as MatchState, MatchSettings } from "../../rooms";
import { BallSettings, PlayerInput, PlayerSettings } from "../../schemas";

export class MatchRoom extends Room<MatchState> {
  private logger: Logger;

  constructor() {
    super();

    this.maxClients = 2;
    this.logger = new Logger("Room_Match");
  }

  public onCreate(options: any): void {
    if (options.private) {
      this.setPrivate();
    }

    this.setState(
      new MatchState({
        onEnd: this.onEnd.bind(this),
        onStart: this.onStart.bind(this),
        onScore: this.onScore.bind(this),
      })
    );

    this.logger.logInfo(`Room created: ${this.roomId}`);

    this.onMessage("input_move", this.onInputMove.bind(this));
    this.onMessage("input_action", this.onInputAction.bind(this));
    this.onMessage("ball_settings", this.onBallSettings.bind(this));
    this.onMessage("match_settings", this.onMatchSettings.bind(this));
    this.onMessage("player_settings", this.onPlayerSettings.bind(this));
  }

  public onJoin(client: Client): void {
    this.logger.logInfo(`Client joined: ${client.sessionId}`);
    this.state.createPlayer(client.sessionId, this.clients.length === 2);
  }

  public onLeave(client: Client): void {
    this.lock();
    this.logger.logInfo(`Client left: ${client.sessionId}`);
    this.state.removePlayer(client.sessionId);
  }

  private onInputMove(client: Client, input: PlayerInput): void {
    this.state.playerMove(client.sessionId, input);
  }

  private onInputAction(client: Client): void {
    this.state.playerAction(client.sessionId);
  }

  private onPlayerSettings(client: Client, settings: PlayerSettings): void {
    this.state.changePlayerSettings(client.sessionId, settings);
  }

  private onBallSettings(_: Client, settings: BallSettings): void {
    this.state.changeBallSettings(settings);
  }

  private onMatchSettings(_: Client, settings: MatchSettings): void {
    this.state.changeMatchSettings(settings);
  }

  private onScore(side: "left" | "right"): void {
    this.broadcast("score", { side });
  }

  private onEnd(winner: string, tie: boolean) {
    this.lock();
    this.broadcast("match_end", { winner, tie });
  }

  private onStart() {
    this.lock();
    this.broadcast("match_start");
  }
}
