"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = require("winston");
class Logger {
    constructor(service, level) {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logger = (0, winston_1.createLogger)({
            level: level || "info",
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.colorize(), winston_1.format.printf((info) => `${info.timestamp} ${info.level} | [${info.service}] | ${info.message}` +
                (info.splat !== undefined ? `${info.splat}` : " "))),
            defaultMeta: { service: service || "Logger" },
            transports: [
                new winston_1.transports.Console(),
                new winston_1.transports.File({ filename: "error.log", level: "error" }),
            ],
        });
    }
    logInfo(message) {
        this.logger.log("info", message);
    }
    logError(message) {
        this.logger.log("error", message);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map