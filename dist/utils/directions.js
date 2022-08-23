"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectionVectors = exports.IndexesToDirections = void 0;
const victor_1 = __importDefault(require("victor"));
exports.IndexesToDirections = [
    0 /* Direction.E */,
    1 /* Direction.NE */,
    2 /* Direction.N */,
    3 /* Direction.NW */,
    4 /* Direction.W */,
    5 /* Direction.SW */,
    6 /* Direction.S */,
    7 /* Direction.SE */,
];
exports.DirectionVectors = {
    [0 /* Direction.E */]: new victor_1.default(1, 0),
    [1 /* Direction.NE */]: new victor_1.default(1, -1).normalize(),
    [2 /* Direction.N */]: new victor_1.default(0, -1),
    [3 /* Direction.NW */]: new victor_1.default(-1, -1).normalize(),
    [4 /* Direction.W */]: new victor_1.default(-1, 0),
    [5 /* Direction.SW */]: new victor_1.default(-1, 1).normalize(),
    [6 /* Direction.S */]: new victor_1.default(0, 1),
    [7 /* Direction.SE */]: new victor_1.default(1, 1).normalize(),
    [-1 /* Direction.NONE */]: new victor_1.default(0, 0),
};
//# sourceMappingURL=directions.js.map