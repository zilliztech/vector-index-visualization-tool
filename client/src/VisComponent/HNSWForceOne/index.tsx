import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { ILevel, NodeType, LinkType } from "Types";
import * as d3 from "d3";

const HNSWForceOne = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "hnsw_all_in_one_svg";
  const { width, height } = useClientRect({ svgId });

  const { levelMapCoords } = useNodeLayout({
    width,
    height,
    visData,
    searchStatus,
  });

  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{ backgroundColor: "#000" }}
    >
      {visData.map((_, level) => (
        <g key={level} id={`level-${level}`}>
          <path
            id="border"
            d={`M${levelMapCoords[level]
              .map((coord) => `${coord}`)
              .join("L")}Z`}
            fill="#fff"
            opacity="0.2"
          />
        </g>
      ))}
    </svg>
  );
});

export default HNSWForceOne;

const useNodeLayout = ({
  width,
  height,
  visData,
  searchStatus,
  xBias = 0.7,
  yBias = 0.7,
  yOver = 0.3,
  padding = [30, 20],
}: {
  width: number;
  height: number;
  visData: ILevel[];
  searchStatus: string;
  xBias?: number;
  yBias?: number;
  yOver?: number;
  padding?: TCoord;
}) => {
  let levelMapCoords = visData.map((_) => []) as TCoord[][];
  if (width > 0 && height > 0 && searchStatus === "ok") {
    const levelCount = visData.length;
    const levelHeight =
      (height - padding[1] * 2) / (levelCount - (levelCount - 1) * yOver);
    const transform = ([x, y]: TCoord, level: number) => {
      const _x = x / width;
      const _y = y / height;

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

    console.log("transform", transform);

    levelMapCoords = visData.map((_, i) =>
      [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ].map((coord) => transform(coord as TCoord, i))
    );
  }
  return { levelMapCoords };
};

export type TCoord = [number, number];
