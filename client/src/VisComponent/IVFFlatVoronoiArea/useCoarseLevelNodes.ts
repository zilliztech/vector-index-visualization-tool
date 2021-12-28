import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { ILevel, IIVFVoronoiAreaNode, NodeType } from "Types";
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

export const useCoarseLevelNodes = ({
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


