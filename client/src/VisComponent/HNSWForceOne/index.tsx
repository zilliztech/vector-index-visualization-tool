import React, { useEffect, useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { ILevel, INode, ILink, NodeType, LinkType, ELayoutType } from "Types";
import * as d3 from "d3";
import { toJS } from "mobx";

const angles = d3.range(0, 360, 45);

const angleXYs = [
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
];

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
    xBias: 0.63,
    yBias: 0.7,
    yOver: 0.35,
  });

  const { nodeCoordMap, layoutFinished } = useNodeCoordMap({
    width: forceWidth,
    height: forceHeight,
    visData,
    searchStatus,
  });

  const interLevelGap = 200;
  const intraLevelGap = 1000;
  const { nodeShowTime, linkShowTime } = useTransitionTime({
    visData,
    searchStatus,
    interLevelGap,
    intraLevelGap,
  });

  const targetCoord = nodeCoordMap["target"] || [
    forceWidth / 2,
    forceHeight / 2,
  ];
  // console.log("targetCoord", targetCoord);

  useEffect(() => {
    if (layoutFinished) {
      visData.forEach((levelData, level) => {
        const { nodes, links } = levelData;
        nodes.forEach((node) => {
          const nodeId = `node-${level}-${node.id}`;
          d3.select(`#${nodeId}`)
            .transition()
            .duration(interLevelGap * 0)
            .delay(nodeShowTime[nodeId])
            .attr("opacity", 1);
        });
        links.forEach((link) => {
          const { source, target } = link;
          const t = transform(nodeCoordMap[target], level);
          const linkId = `link-${level}-${source}-${target}`;
          d3.select(`#${linkId}`)
            .transition()
            .duration(interLevelGap)
            .delay(linkShowTime[linkId])
            .attr("x2", t[0])
            .attr("y2", t[1]);
        });
        const intraLevelLinkId = `intra-level-${level}`;
        const t = transform(nodeCoordMap[levelData.entry_ids[0]], level);
        d3.select(`#${intraLevelLinkId}`)
          .transition()
          .duration(intraLevelGap)
          .delay(linkShowTime[intraLevelLinkId])
          .attr("x2", t[0] + 0.01)
          .attr("y2", t[1]);
      });
    }
  }, [layoutFinished]);

  const getLineGradient = (link: ILink) => {
    const { source, target } = link;
    const sourceCoord = transform(nodeCoordMap[source], 0);
    const targetCoord = transform(nodeCoordMap[target], 0);
    const _x = targetCoord[0] - sourceCoord[0];
    const _y = sourceCoord[1] - targetCoord[1];
    let angle = (Math.atan(_x / _y) / Math.PI) * 180;
    if (angle < 0) {
      if (targetCoord[0] < sourceCoord[0]) {
        angle += 360;
      } else {
        angle += 180;
      }
    } else {
      if (targetCoord[0] < sourceCoord[0]) {
        angle += 180;
      }
    }
    // const angleDiff = angles.map((x) => Math.abs(x - angle));
    // const standardAngle = angles[d3.minIndex(angleDiff)];
    const angleSlice = 45;
    const angleN = Math.floor((angle + angleSlice / 2) / angleSlice);
    let standardAngle = angleN * angleSlice;
    if (standardAngle === 360) {
      standardAngle = 0;
    }
    return `url('#line-gradient-${standardAngle}')`;
  };

  const getNodeR = (node: INode, level: number) => {
    if (node.type === NodeType.Fine && level === visData.length - 1) {
      return 5;
    }
    if (node.type === NodeType.Fine || node.type === NodeType.Candidate) {
      return 4;
    }
    return 2;
  };

  const getNodeFill = (node: INode, level: number) => {
    if (node.type === NodeType.Fine && level === visData.length - 1) {
      return `url(#fine-gradient)`;
    }
    if (node.type === NodeType.Fine || node.type === NodeType.Candidate) {
      return "url('#line-gradient-135')";
    }
    return "#bbb";
  };

  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{ backgroundColor: "#000", visibility: "visible" }}
    >
      <defs>
        {angleXYs.map((angle, i) => (
          <linearGradient
            id={`line-gradient-${i * 45}`}
            // gradientTransform="rotate(90)"
            // gradientUnits="userSpaceOnUse"
            x1={angle[0]}
            y1={angle[1]}
            x2={angle[2]}
            y2={angle[3]}
          >
            <stop offset="5%" stop-color="#06F3AF" />
            <stop offset="95%" stop-color="#DBFFF5" />
          </linearGradient>
        ))}
        <linearGradient id={`target-gradient`} x1={0} y1={0} x2={1} y2={1}>
          <stop offset="5%" stop-color="#06AFF2" />
          <stop offset="95%" stop-color="#CCF1FF" />
        </linearGradient>
        <linearGradient id={`fine-gradient`} x1={0} y1={0} x2={1} y2={1}>
          <stop offset="5%" stop-color="#635DCE" />
          <stop offset="95%" stop-color="#E3E1FF" />
        </linearGradient>
        <filter id="blur" x="0" y="0">
          <feGaussianBlur stdDeviation="5" result="offset-blur" />
          <feComposite
            operator="out"
            in="SourceGraphic"
            in2="offset-blur"
            result="inverse"
          />
          <feFlood flood-color="#444" flood-opacity=".95" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>
      {[...visData].reverse().map((levelData, _level) => {
        const level = visData.length - 1 - _level;
        return (
          <g key={level} id={`level-${level}`}>
            {levelMapCoords[level].length > 0 && (
              <path
                id="border"
                d={`M${levelMapCoords[level]
                  .map((coord) => `${coord}`)
                  .join("L")}Z`}
                fill="#222"
                opacity="0.8"
                filter={`url(#blur)`}
              />
            )}
            {layoutFinished && (
              <>
                {level > 0 && (
                  <line
                    key={`intra-level-${level}`}
                    id={`intra-level-${level}`}
                    fill="none"
                    opacity="0.7"
                    stroke="url('#line-gradient-180')"
                    // stroke="red"
                    strokeWidth="8"
                    x1={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[0]
                    }
                    y1={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[1]
                    }
                    x2={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[0]
                    }
                    y2={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[1]
                    }
                  />
                )}
                <g id="links-g">
                  {levelData.links.map(
                    (link) =>
                      link.source in nodeCoordMap &&
                      link.target in nodeCoordMap && (
                        <line
                          key={`link-${level}-${link.source}-${link.target}`}
                          id={`link-${level}-${link.source}-${link.target}`}
                          fill="none"
                          opacity="0.6"
                          stroke={
                            link.type === LinkType.Searched ||
                            link.type === LinkType.Fine
                              ? getLineGradient(link)
                              : "none"
                          }
                          strokeWidth={
                            link.type === LinkType.Searched ||
                            link.type === LinkType.Fine
                              ? 7
                              : 1
                          }
                          x1={transform(nodeCoordMap[link.source], level)[0]}
                          y1={transform(nodeCoordMap[link.source], level)[1]}
                          x2={transform(nodeCoordMap[link.source], level)[0]}
                          y2={transform(nodeCoordMap[link.source], level)[1]}
                        />
                      )
                  )}
                </g>
                <g id="circles-g">
                  {levelData.nodes.map((node) => (
                    <ellipse
                      key={node.id}
                      id={`node-${level}-${node.id}`}
                      opacity={0}
                      cx={transform(nodeCoordMap[node.id], level)[0]}
                      cy={transform(nodeCoordMap[node.id], level)[1]}
                      fill={getNodeFill(node, level)}
                      rx={getNodeR(node, level) + 1}
                      ry={getNodeR(node, level)}
                      style={{ transform: `rotate(45)` }}
                      // stroke="#fff"
                      // strokeWidth={node.type === NodeType.Coarse ? 0 : 1}
                    />
                  ))}
                </g>
                {level >= visData.length - 1 && (
                  <g id="target-g">
                    <ellipse
                      cx={transform(targetCoord, level)[0]}
                      cy={transform(targetCoord, level)[1]}
                      fill="url(#target-gradient)"
                      rx={6}
                      ry={5}
                      style={{ transform: `rotate(45)` }}
                      stroke="#ddd"
                    />
                  </g>
                )}
              </>
            )}
          </g>
        );
      })}
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
      const nodes = nodeIds.map(
        (nodeId) =>
          ({
            id: `${nodeId}`,
            dist: nodeId2dist[nodeId],
            x: 0,
            y: 0,
          } as {
            id: string;
            dist: number;
            x: number;
            y: number;
            fx?: number;
            fy?: number;
          })
      );

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

      const targetOrigin = [width * 0.5, height * 0.5];
      const targetNodeProjection = {
        id: "target",
        dist: 0,
        x: targetOrigin[0],
        y: targetOrigin[1],
        fx: targetOrigin[0], // 确保不会受到forceRadius的影响
        fy: targetOrigin[1],
      };
      nodes.push(targetNodeProjection);
      visData[0].fine_ids.forEach((fine_id) => {
        links.push({
          target: "target",
          source: `${fine_id}`,
          type: LinkType.None,
        });
      });
      const maxR = Math.min(width / 2, height / 2);

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
                  .strength((d) =>
                    // make Fine-Node closer to Target-Node
                    (d as any).type === LinkType.None ? 0.9 : 0.4
                  )
              )
              .force(
                "r",
                d3
                  .forceRadial(
                    (node) => r((node as any).dist),
                    targetOrigin[0],
                    targetOrigin[1]
                  )
                  .strength(0.6)
              )
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
        
        // make targetNode be shown in the appropriate place
        if (x(targetNodeProjection.x) < targetOrigin[0]) {
          x.range([width - padding[0], padding[0]]);
        }
        if (y(targetNodeProjection.y) < targetOrigin[1]) {
          x.range([height - padding[1], padding[1]]);
        }

        nodes.forEach((node) => {
          coordMap[node.id] = [x(node.x), y(node.y)];
          // coordMap[node.id] = [node.x, node.y];
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
        const targetId = `node-${level}-${target}`;
        const linkId = `link-${level}-${source}-${target}`;
        if (!(sourceId in nodeShowTime)) {
          if (level > 0) {
            const intraLinkId = `intra-level-${level}`;
            linkShowTime[intraLinkId] = currentTime;
            currentTime += intraLevelGap;
            nodeShowTime[sourceId] = currentTime;
          } else {
            nodeShowTime[sourceId] = currentTime;
          }
        }
        if (!(linkId in linkShowTime)) {
          linkShowTime[linkId] = currentTime;
        } else {
          console.log("link depulicate", level, link);
        }
        currentTime += interLevelGap;
        if (!(targetId in nodeShowTime)) {
          nodeShowTime[targetId] = currentTime;
        }
      });
    });
  }

  return { nodeShowTime, linkShowTime };
};

export type TCoord = [number, number];
