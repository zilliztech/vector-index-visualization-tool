

import {ILevel, TCoord} from "Types";

// Project: [width, height] => [forceWidth, forceHeight] with bias.
export const useTransform = ({
  width,
  height,
  forceWidth,
  forceHeight,
  visData,
  searchStatus,
  xBias = 0.68,
  yBias = 0.7,
  yOver = 0.35,
  padding = [30, 20],
}: {
  width: number;
  height: number;
  forceWidth: number;
  forceHeight: number;
  visData: ILevel[];
  searchStatus: string;
  xBias?: number;
  yBias?: number;
  yOver?: number;
  padding?: TCoord;
}) => {
  let levelMapCoords = visData.map((_) => []) as TCoord[][];
  let transform = ([x, y]: TCoord, level: number) => [0, 0] as TCoord;
  if (width > 0 && height > 0 && searchStatus === "ok") {
    const levelCount = visData.length;
    const levelHeight =
      (height - padding[1] * 2) / (levelCount - (levelCount - 1) * yOver);
    transform = ([x, y]: TCoord, level: number) => {
      const _x = x / forceWidth;
      const _y = y / forceHeight;

      const newX =
        padding[0] +
        (width - padding[0] * 2) * xBias +
        _x * (width - padding[0] * 2) * (1 - xBias) -
        _y * (width - padding[0] * 2) * xBias;
      const newY =
        padding[1] +
        levelHeight * (1 - yOver) * level +
        _x * levelHeight * (1 - yBias) +
        _y * levelHeight * yBias;
      return [newX, newY] as TCoord;
    };

    levelMapCoords = visData.map((_, i) =>
      [
        [0, 0],
        [forceWidth, 0],
        [forceWidth, forceHeight],
        [0, forceHeight],
      ].map((coord) => transform(coord as TCoord, i))
    );
  }
  return { transform, levelMapCoords };
};