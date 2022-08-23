import Victor from "victor";

export const enum Direction {
  E = 0,
  NE = 1,
  N = 2,
  NW = 3,
  W = 4,
  SW = 5,
  S = 6,
  SE = 7,
  NONE = -1,
}

export const IndexesToDirections = [
  Direction.E,
  Direction.NE,
  Direction.N,
  Direction.NW,
  Direction.W,
  Direction.SW,
  Direction.S,
  Direction.SE,
];

export const DirectionVectors = {
  [Direction.E]: new Victor(1, 0),
  [Direction.NE]: new Victor(1, -1).normalize(),
  [Direction.N]: new Victor(0, -1),
  [Direction.NW]: new Victor(-1, -1).normalize(),
  [Direction.W]: new Victor(-1, 0),
  [Direction.SW]: new Victor(-1, 1).normalize(),
  [Direction.S]: new Victor(0, 1),
  [Direction.SE]: new Victor(1, 1).normalize(),
  [Direction.NONE]: new Victor(0, 0),
};
