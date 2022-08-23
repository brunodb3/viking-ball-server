"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textureMap = void 0;
// ? Each tile is scaled to 1.5
const fieldTile = { width: 64 * 1.5, height: 64 * 1.5 };
exports.textureMap = {
    player: {
        width: 64,
        height: 64,
    },
    ball: {
        width: 18,
        height: 18,
    },
    goal: {
        width: 44 - 30,
        height: 144,
    },
    fieldTile,
    field: {
        width: fieldTile.width * 11,
        height: fieldTile.height * 6, // ? times 6 tiles
    },
};
//# sourceMappingURL=textureMap.js.map