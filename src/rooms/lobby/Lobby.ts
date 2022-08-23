import { Room, Client } from "colyseus";

import { Logger } from "@utils";

export class LobbyRoom extends Room {
  private logger: Logger;

  constructor() {
    super();

    this.logger = new Logger("Room_Lobby");
  }

  public onCreate(): void {
    this.logger.logInfo(`Room created`);
  }

  public onJoin(client: Client): void {
    this.logger.logInfo(`Client joined: ${client.id}`);
  }

  public onLeave(client: Client): void {
    this.logger.logInfo(`Client left: ${client.id}`);
  }
}
