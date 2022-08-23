export interface ITextureMap {
  width: number;
  height: number;
}

// ? Each tile is scaled to 1.5
const fieldTile = { width: 64 * 1.5, height: 64 * 1.5 };

export const textureMap: { [key: string]: ITextureMap } = {
  player: {
    width: 64,
    height: 64,
  },
  ball: {
    width: 18,
    height: 18,
  },
  goal: {
    width: 44 - 30, // ? We remove 30px from the width so the ball can go in
    height: 144,
  },
  fieldTile,
  field: {
    width: fieldTile.width * 11, // ? times 11 tiles
    height: fieldTile.height * 6, // ? times 6 tiles
  },
};
