import React, { useState, useEffect } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import {
  ILevel,
  IIVFVoronoiAreaNode,
  IIVFVoronoiAreaFineNode,
  NodeType,
  LevelStatus,
} from "Types";
import { useClientRect, useLevelStatus } from "Hooks";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { get } from "lodash";

import { vecCmp } from "Utils";

// const colorScheme = d3.schemeTableau10;
const colorScheme = [
  "#66c2a5",
  "#fc8d62",
  "#8da0cb",
  "#e78ac3",
  "#a6d854",
  "#ffd92f",
  "#e5c494",
  "#b3b3b3",
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
  })
);

const IVFFlatVoronoiArea = observer(() => {
  const store = useGlobalStore();
  const classes = useStyles();
  const svgId = "ivf_flat_voronoi_area_svg";
  const { visData, searchStatus } = store;

  const { width, height } = useClientRect({ svgId });

  const { coarsLevelForceFinished, coarseLevelNodes } = useCoarseLevelNodes({
    data: visData[0],
    searchStatus,
    width,
    height,
  });

  const { fineLevelForceFinished, fineLevelNodes } = useFineLevelNodes({
    data: visData[1],
    coarseLevelNodes,
    coarsLevelForceFinished,
    searchStatus,
    width,
    height,
  });

  const enterTime = 1.5;
  const exitTime = 1;

  const { levelStatus, initLevel, setPreLevel, setNextLevel } = useLevelStatus({
    exitTime: exitTime * 1000,
  });

  if (
    searchStatus === "ok" &&
    coarsLevelForceFinished &&
    fineLevelForceFinished
  ) {
    initLevel();
  }

  const changeLevel = () => {
    if (levelStatus.level === 0) {
      setNextLevel();
    } else {
      setPreLevel();
    }
  };

  return (
    <div className={classes.root}>
      <svg
        id={svgId}
        width="100%"
        height="100%"
        style={{ backgroundColor: "#000" }}
      >
        {levelStatus.level === 0 && (
          <g id="coarse-level">
            {coarseLevelNodes
              .filter((node) => node.type !== NodeType.Fine)
              .map((node) => (
                <path
                  key={node.id}
                  d={node.pathD}
                  fill={"#000"}
                  stroke={"#06F3AF"}
                  strokeWidth={"1"}
                  opacity={levelStatus.status === LevelStatus.Enter ? 1 : 0}
                  style={{
                    transition: `all ${
                      levelStatus.status === LevelStatus.Enter
                        ? enterTime
                        : exitTime
                    }s ease`,
                  }}
                />
              ))}

            {coarseLevelNodes
              .filter((node) => node.type === NodeType.Fine)
              .map((node) => (
                <>
                  <path
                    key={node.id}
                    d={node.pathD}
                    fill={"#06F3AF"}
                    stroke={"#fff"}
                    strokeWidth={"3"}
                    // opacity={1}
                    opacity={levelStatus.status === LevelStatus.Enter ? 1 : 0.9}
                    transform={
                      levelStatus.status === LevelStatus.Enter
                        ? ""
                        : `translate(${node.translate[0]}, ${node.translate[1]})`
                    }
                    style={{
                      transition: `all ${
                        levelStatus.status === LevelStatus.Enter
                          ? enterTime
                          : exitTime
                      }s ease`,
                    }}
                  />
                  {/* <text key={`id-${node.id}`} x={node.x-30} y={node.y}>
                    {node.id}
                  </text> */}
                </>
              ))}
          </g>
        )}

        {levelStatus.level === 1 && (
          <g id="fine-level">
            <g id="fine-centroid-cluster">
              {coarseLevelNodes
                .filter((node) => node.type === NodeType.Fine)
                .map((node) => (
                  <path
                    key={node.id}
                    id={node.id}
                    d={node.pathD}
                    // d={
                    //   levelStatus.status === LevelStatus.Enter
                    //     ? getPolarD[node.cluster_id || 0]
                    //     : node.pathD
                    // }
                    fill={"#06F3AF"}
                    stroke={"#fff"}
                    strokeWidth={"3"}
                    opacity={levelStatus.status === LevelStatus.Enter ? 0 : 0.9}
                    transform={`translate(${node.translate})`}
                    style={{
                      transition: `all ${
                        levelStatus.status === LevelStatus.Enter
                          ? enterTime
                          : exitTime
                      }s ease`,
                    }}
                    // style={{
                    //   animationName: 'path',
                    //   animationDuration: '3s'
                    // }}
                  />
                ))}
            </g>
            {fineLevelNodes.map((node) => (
              <circle
                key={node.id}
                cx={
                  levelStatus.status === LevelStatus.Enter
                    ? node.x
                    : node.centroidX
                }
                cy={
                  levelStatus.status === LevelStatus.Enter
                    ? node.y
                    : node.centroidY
                }
                // opacity={levelStatus.status === LevelStatus.Enter ? 1 : 0.3}
                opacity={node.type === NodeType.Fine ? 1 : 0.6}
                r={node.type === NodeType.Fine ? 7 : 5}
                strokeWidth={node.type === NodeType.Fine ? 1 : 0}
                stroke={"#fff"}
                fill={node.color}
                style={{
                  transition: `all ${
                    levelStatus.status === LevelStatus.Enter
                      ? enterTime
                      : exitTime
                  }s ease`,
                }}
              />
            ))}
          </g>
        )}

        <g
          id="stepper"
          transform={`translate(${width - 50}, ${10})`}
          style={{
            cursor: "pointer",
          }}
          onClick={changeLevel}
        >
          <rect width="30" height="30" fill="#fff" />
          {levelStatus.level === 0 ? (
            <ZoomOutMapIcon width="30" height="30" />
          ) : (
            <ZoomInMapIcon width="30" height="30" />
          )}
        </g>
      </svg>
    </div>
  );
});

export default IVFFlatVoronoiArea;

const useCoarseLevelNodes = ({
  data,
  searchStatus,
  width,
  height,
}: {
  data: ILevel;
  searchStatus: string;
  width: number;
  height: number;
}) => {
  const [coarseLevelNodes, setCoarseLevelNodes] = useState<
    IIVFVoronoiAreaNode[]
  >([]);
  const [coarsLevelForceFinished, setCoarseLevelForceFinished] =
    useState(false);
  const [computeTimer, setComputeTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    setCoarseLevelForceFinished(false);
    computeTimer && clearTimeout(computeTimer);

    if (searchStatus === "ok") {
      const nodes = data.nodes
        .filter((node) => node.type !== NodeType.Target)
        .map((node) =>
          Object.assign({}, node, {
            x: 0,
            y: 0,
            r: 0,
            countP: 0,
            countArea: 0,
            polygonCentroid: [0, 0],
            polarPolyCentroid: [0, 0],
            pathD: "",
            translate: [0, 0],
            color: "string",
          })
        ) as IIVFVoronoiAreaNode[];
      const x = d3
        .scaleLinear()
        .domain(
          d3.extent(nodes, (node) => node.projection[0]) as [number, number]
        )
        .nice()
        .range([0, width]);
      const y = d3
        .scaleLinear()
        .domain(
          d3.extent(nodes, (node) => node.projection[1]) as [number, number]
        )
        .nice()
        .range([height, 0]);

      const allCount = nodes.reduce((acc, node) => acc + (node.count || 0), 0);
      const allArea = width * height;

      nodes.forEach((node) => {
        node.x = x(node.projection[0]);
        node.y = y(node.projection[1]);
        node.countP = node.count / allCount;
        node.countArea = node.countP * allArea;
      });

      // const idealAreaRange = [100, 1000];
      const idealAreaRange = (
        d3.extent(nodes, (node) => node.countArea) as [number, number]
      ).map((a) => a * 0.92);

      const r2 = d3
        .scaleLinear()
        .domain(d3.extent(nodes, (node) => node.countArea) as [number, number])
        .range(idealAreaRange);

      nodes.forEach((node) => {
        node.r = Math.sqrt(r2((node as any).countArea) / Math.PI);
      });
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "collision",
          d3.forceCollide().radius((node) => (node as IIVFVoronoiAreaNode).r)
        )
        // .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

      simulation.on("tick", () => {
        // border
        nodes.forEach((node) => {
          node.x = Math.max(node.r, Math.min(width - node.r, node.x));
          node.y = Math.max(node.r, Math.min(height - node.r, node.y));
        });
      });

      const addVoronoiInfo = ({ nodes }: { nodes: IIVFVoronoiAreaNode[] }) => {
        const delaunay = d3.Delaunay.from(
          nodes.map((node) => [node.x, node.y])
        );
        const voronoi = delaunay.voronoi([0, 0, width, height]);
        const cells = nodes.map((_, i) => voronoi.cellPolygon(i));
        nodes.forEach((node, i) => {
          node.polygonCentroid = d3.polygonCentroid(
            cells[i] as [number, number][]
          );
          node.pathD = voronoi.renderCell(i);
        });
      };

      const addCentroidOrder = ({
        nodes,
      }: {
        nodes: IIVFVoronoiAreaNode[];
      }) => {
        const clusterIdList = vecCmp(nodes, "cluster_id");
        const origin = [width / 2, height / 2];
        const maxR = Math.min(width, height) * 0.5 - 5;
        const angleStep = (Math.PI * 2) / clusterIdList.length;
        const clusterCenterList = clusterIdList.map(
          (_, i) =>
            [
              origin[0] + (maxR / 2) * Math.sin(angleStep * (i + 0.5)),
              origin[1] - (maxR / 2) * Math.cos(angleStep * (i + 0.5)),
            ] as [number, number]
        );
        const getPolarD = {} as { [key: number]: string };
        clusterIdList.forEach((cluster_id, i) => {
          const startX = origin[0] + maxR * Math.sin(angleStep * i);
          const startY = origin[1] - maxR * Math.cos(angleStep * i);
          const endX = origin[0] + maxR * Math.sin(angleStep * (i + 1));
          const endY = origin[1] - maxR * Math.cos(angleStep * (i + 1));
          getPolarD[cluster_id || 0] =
            `M${origin[0]},${origin[1]}L${startX},${startY}` +
            `A${maxR + 5},${maxR + 5},0,0,1,${endX},${endY}Z`;
        });
        nodes.forEach((node) => {
          const clusterOrder = clusterIdList.indexOf(node.cluster_id);
          node.polarPolyCentroid = clusterCenterList[clusterOrder];
          node.translate = [
            node.polarPolyCentroid[0] - node.polygonCentroid[0],
            node.polarPolyCentroid[1] - node.polygonCentroid[1],
          ];
          node.color = colorScheme[clusterOrder];
          node.polarPathD = getPolarD[node.cluster_id || 0];
        });
      };

      const timer = setTimeout(() => {
        addVoronoiInfo({ nodes });
        addCentroidOrder({
          nodes: nodes.filter((node) => node.type === NodeType.Fine),
        });
        setCoarseLevelNodes(nodes);
        setCoarseLevelForceFinished(true);
        simulation.stop();
      }, 1000);
      setComputeTimer(timer);

      return () => {
        simulation.stop();
        computeTimer && clearTimeout(computeTimer);
      };
    }
  }, [data, width, height, searchStatus]);

  return { coarsLevelForceFinished, coarseLevelNodes };
};

const useFineLevelNodes = ({
  data,
  coarseLevelNodes,
  coarsLevelForceFinished,
  searchStatus,
  width,
  height,
}: {
  data: ILevel;
  coarseLevelNodes: IIVFVoronoiAreaNode[];
  coarsLevelForceFinished: boolean;
  searchStatus: string;
  width: number;
  height: number;
}) => {
  const [fineLevelNodes, setFineLevelNodes] = useState<
    IIVFVoronoiAreaFineNode[]
  >([]);
  const [fineLevelForceFinished, setFineLevelForceFinished] = useState(false);
  const [computeTimer, setComputeTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    setFineLevelForceFinished(false);
    computeTimer && clearTimeout(computeTimer);

    if (
      searchStatus === "ok" &&
      coarsLevelForceFinished &&
      width > 0 &&
      height > 0
    ) {
      const fineCentroidNodes = coarseLevelNodes.filter(
        (node) => node.type === NodeType.Fine
      );
      const clusterId2centroidPos = {} as {
        [key: string | number]: [number, number];
      };
      const clusterId2centroidColor = {} as {
        [key: string | number]: string;
      };
      fineCentroidNodes.forEach((node) => {
        clusterId2centroidPos[node.cluster_id || 0] = node.polarPolyCentroid;
        clusterId2centroidColor[node.cluster_id || 0] = node.color;
      });

      const nodes = data.nodes
        .filter((node) => node.type !== NodeType.Target)
        .map((node) => {
          const coarseCentrodPos = get(
            clusterId2centroidPos,
            node.cluster_id || 0,
            [0, 0]
          );
          const coarseCentrodColor = get(
            clusterId2centroidColor,
            node.cluster_id || 0,
            "#ccc"
          );
          const _r = Math.random() * 20;
          const _sita = Math.random() * 2 * Math.PI;
          const _x = _r * Math.sin(_sita);
          const _y = _r * Math.cos(_sita);
          return Object.assign({}, node, {
            x: coarseCentrodPos[0] + _x,
            y: coarseCentrodPos[1] + _y,
            r: 0,
            color: coarseCentrodColor,
            centroidX: coarseCentrodPos[0] + _x,
            centroidY: coarseCentrodPos[1] + _y,
          });
        }) as IIVFVoronoiAreaFineNode[];
      // const clusterIdList = Array.from(
      //   new Set(nodes.map((node) => node.cluster_id))
      // );
      const origin = [width / 2, height / 2];
      const maxR = Math.min(width, height) * 0.5 - 5;
      // const angleStep = (Math.PI * 2) / clusterIdList.length;
      // const clusterCenterList = clusterIdList.map((_, i) => [
      //   origin[0] + (maxR / 2) * Math.sin(angleStep * (i + 0.5)),
      //   origin[1] - (maxR / 2) * Math.cos(angleStep * (i + 0.5)),
      // ]);
      const r = d3
        .scaleLinear()
        .domain(
          [
            d3.min(
              nodes.filter((node) => node.dist > 0.001),
              (node) => node.dist
            ) as number,
            (d3.max(nodes, (node) => node.dist) as number) * 0.95,
          ]
          // d3.extent(
          //   nodes.filter((node) => node.dist > 0.001),
          //   (node) => node.dist
          // ) as [number, number]
        )
        .range([maxR * 0.2, maxR])
        .clamp(true);
      nodes.forEach((node) => {
        node.r = r(node.dist);
        // const clusterOrder = clusterIdList.indexOf(node.cluster_id);
        // const clusterCenter = clusterCenterList[clusterOrder];
        // node.x = clusterCenter[0];
        // node.y = clusterCenter[1];
        // node.color = colorScheme[clusterOrder];
      });

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "collision",
          d3
            .forceCollide()
            .radius((_) => 5)
            .strength(0.4)
        )
        .force(
          "r",
          d3
            .forceRadial(
              (node) => (node as IIVFVoronoiAreaFineNode).r,
              origin[0],
              origin[1]
            )
            .strength(1)
        );

      const timer = setTimeout(() => {
        simulation.stop();
        setFineLevelNodes(nodes);
        setFineLevelForceFinished(true);
      }, 1000);

      setComputeTimer(timer);
      return () => {
        simulation.stop();
        computeTimer && clearTimeout(computeTimer);
      };
    }
  }, [
    data,
    coarseLevelNodes,
    coarsLevelForceFinished,
    searchStatus,
    width,
    height,
  ]);

  return { fineLevelNodes, fineLevelForceFinished };
};
