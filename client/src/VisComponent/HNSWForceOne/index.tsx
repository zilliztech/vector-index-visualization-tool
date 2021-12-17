import React, { useEffect, useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { ILevel, ILink, NodeType, LinkType, ELayoutType } from "Types";
import * as d3 from "d3";
import { toJS } from "mobx";

const HNSWForceOne = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "hnsw_all_in_one_svg";
  const { width, height } = useClientRect({ svgId });
  const forceWidth = width;
  const forceHeight = visData.length > 0 ? height : height / visData.length;

  const { transform, levelMapCoords } = useTransform({
    width,
    height,
    forceWidth,
    forceHeight,
    visData,
    searchStatus,
  });

  const { nodeCoordMap, layoutFinished } = useNodeCoordMap({
    width: forceWidth,
    height: forceHeight,
    visData,
    searchStatus,
  });

  const interLevelGap = 500;
  const intraLevelGap = 2000;
  const { nodeShowTime, linkShowTime } = useTransitionTime({
    visData,
    searchStatus,
    interLevelGap,
    intraLevelGap,
  });

  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{ backgroundColor: "#000" }}
    >
      {visData.map((levelData, level) => (
        <g key={level} id={`level-${level}`}>
          {levelMapCoords[level].length > 0 && (
            <path
              id="border"
              d={`M${levelMapCoords[level]
                .map((coord) => `${coord}`)
                .join("L")}Z`}
              fill="#fff"
              opacity="0.2"
            />
          )}
          {layoutFinished && (
            <>
              <g id="links-g">
                {levelData.links.map(
                  (link) =>
                    link.source in nodeCoordMap &&
                    link.target in nodeCoordMap && (
                      <path
                        key={`link-${level}-${link.source}-${link.target}`}
                        fill="none"
                        opacity="0.2"
                        stroke="#ddd"
                        strokeWidth="1"
                        d={`M${transform(
                          nodeCoordMap[link.source],
                          level
                        )}L${transform(nodeCoordMap[link.target], level)}`}
                      />
                    )
                )}
              </g>
              <g id="circles-g">
                {levelData.nodes.map((node) => (
                  <circle
                    key={node.id}
                    id={`node-${level}-${node.id}`}
                    cx={transform(nodeCoordMap[node.id], level)[0]}
                    cy={transform(nodeCoordMap[node.id], level)[1]}
                    fill="#06F3AF"
                    r={3}
                  />
                ))}
              </g>
              {level > 0 && (
                <path
                  key={`intra-level-${level}`}
                  fill="none"
                  opacity="0.6"
                  stroke="#ddd"
                  strokeWidth="2"
                  d={`M${transform(
                    nodeCoordMap[levelData.entry_ids[0]],
                    level - 1
                  )}L${transform(nodeCoordMap[levelData.entry_ids[0]], level)}`}
                />
              )}
            </>
          )}
        </g>
      ))}
    </svg>
  );
});

export default HNSWForceOne;

const useNodeCoordMap = ({
  width,
  height,
  visData,
  searchStatus,
  computeTime = 3000,
  padding = [50, 20],
  layoutType = ELayoutType.ForceDist,
}: {
  width: number;
  height: number;
  visData: ILevel[];
  searchStatus: string;
  computeTime?: number;
  padding?: [number, number];
  layoutType?: ELayoutType;
}) => {
  const [nodeCoordMap, setNodeCoordMap] = useState<{ [key: string]: TCoord }>(
    {}
  );
  const [layoutFinished, setLayoutFinished] = useState(false);
  const [computeTimer, setComputeTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    setLayoutFinished(false);
    computeTimer && clearTimeout(computeTimer);
    if (width > 0 && height > 0 && searchStatus === "ok") {
      const nodeId2dist = {} as { [key: string]: number };
      visData.forEach((levelData) => {
        levelData.nodes.forEach((node) => {
          nodeId2dist[node.id] = node.dist || 0;
        });
      });
      const nodeIds = Object.keys(nodeId2dist);
      const nodes = nodeIds.map((nodeId) => ({
        id: `${nodeId}`,
        dist: nodeId2dist[nodeId],
        x: 0,
        y: 0,
      }));

      const linkStrings = new Set();
      const links = [] as ILink[];
      // de-duplicate
      visData.forEach((levelData) => {
        levelData.links.forEach((link) => {
          if (
            `${link.source}---${link.target}` in linkStrings ||
            `${link.target}---${link.source}` in linkStrings
          ) {
            console.log("link existed", link);
          } else {
            linkStrings.add(`${link.source}---${link.target}`);
            // links.push(toJS(link));
            links.push({
              source: `${link.source}`,
              target: `${link.target}`,
              type: link.type,
            });
          }
        });
      });

      if (nodeIds.indexOf("target") >= 0) {
        console.log("??????", nodes);
      }
      console.log(nodes.length, links.length);
      nodes.push({
        id: "target",
        dist: 0,
        x: width / 2,
        y: height / 2,
      });
      visData[0].fine_ids.forEach((fine_id) => {
        links.push({
          target: "target",
          source: `${fine_id}`,
          type: LinkType.None,
        });
      });
      const maxR = Math.min(width / 2, height / 2);
      console.log(toJS(visData), nodes, links);

      const r = d3
        .scaleLinear()
        .domain(
          d3.extent(
            nodes.filter((node) => node.dist > 0),
            (node) => node.dist
          ) as [number, number]
        )
        .range([20, maxR])
        .clamp(true);

      const simulation =
        layoutType === ELayoutType.Force
          ? d3
              .forceSimulation(nodes)
              .force(
                "link",
                d3
                  .forceLink(links)
                  .id((d) => (d as any).id)
                  .strength(1)
              )
              .force("center", d3.forceCenter(width / 2, height / 2))
              .force("charge", d3.forceManyBody().strength(-10))
          : d3
              .forceSimulation(nodes)
              .force(
                "link",
                d3
                  .forceLink(links)
                  .id((d) => (d as any).id)
                  .strength(0.4)
              )
              .force(
                "r",
                d3
                  .forceRadial(
                    (node) => r((node as any).dist),
                    width / 2,
                    height / 2
                  )
                  .strength(0.6)
              )
              // .force("center", d3.forceCenter(width / 2, height / 2))
              .force("charge", d3.forceManyBody().strength(-10));

      const timer = setTimeout(() => {
        console.log("force ok~");
        const coordMap = {} as { [key: string]: TCoord };
        simulation.stop();
        nodes.forEach((node) => {
          coordMap[node.id] = [node.x, node.y];
        });

        const x = d3
          .scaleLinear()
          .domain(d3.extent(nodes, (node) => node.x) as TCoord)
          .range([padding[0], width - padding[0]]);
        const y = d3
          .scaleLinear()
          .domain(d3.extent(nodes, (node) => node.y) as TCoord)
          .range([padding[1], height - padding[1]]);

        nodes.forEach((node) => {
          coordMap[node.id] = [x(node.x), y(node.y)];
        });

        setNodeCoordMap(coordMap);
        setLayoutFinished(true);
      }, computeTime);
      setComputeTimer(timer);
    }
  }, [width, height, visData, searchStatus]);

  return { nodeCoordMap, layoutFinished };
};

// Project: [width, height] => [forceWidth, forceHeight] with bias.
const useTransform = ({
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

const useTransitionTime = ({
  visData,
  searchStatus,
  interLevelGap = 1000,
  intraLevelGap = 2000,
}: {
  visData: ILevel[];
  searchStatus: string;
  interLevelGap?: number;
  intraLevelGap?: number;
}) => {
  let currentTime = 0;
  // key = `${level}-${node.id}`
  const nodeShowTime = {} as { [key: string]: number };
  // key = `${level}-${link.source}-${link.target}`
  const linkShowTime = {} as { [key: string]: number };
  if (searchStatus === "ok") {
    visData.forEach((levelData, level) => {
      const links = levelData.links;
      links.forEach((link) => {
        const { source, target } = link;
        const sourceId = `node-${level}-${source}`;
        const targetId = `node-${level}-${source}`;
        const linkId = `link-${level}-${source}-${target}`;
        if (!(sourceId in nodeShowTime)) {
          if (level > 0) {
            currentTime += intraLevelGap;
            const intraLinkId = `intra-level-${level}`;
            linkShowTime[intraLinkId] = currentTime;
          }
          nodeShowTime[sourceId] = currentTime;
        }
        currentTime += interLevelGap;
        if (!(targetId in nodeShowTime)) {
          nodeShowTime[targetId] = currentTime;
        }
        if (!(linkId in linkShowTime)) {
          linkShowTime[linkId] = currentTime;
        } else {
          console.log("link depulicate", level, link);
        }
      });
    });
  }

  return { nodeShowTime, linkShowTime };
};

export type TCoord = [number, number];
