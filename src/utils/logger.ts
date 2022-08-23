import { Logger as Winston, createLogger, format, transports } from "winston";

export class Logger {
  public logger: Winston;

  constructor(service?: string, level?: "error" | "info" | "debug") {
    this.logger = createLogger({
      level: level || "info",
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level} | [${info.service}] | ${info.message}` +
            (info.splat !== undefined ? `${info.splat}` : " ")
        )
      ),
      defaultMeta: { service: service || "Logger" },
      transports: [
        new transports.Console(),
        new transports.File({ filename: "error.log", level: "error" }),
      ],
    });
  }

  logInfo(message: any): void {
    this.logger.log("info", message);
  }

  logError(message: any): void {
    this.logger.log("error", message);
  }
}
