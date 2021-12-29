import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { ILevel, IIVFVoronoiAreaNode, NodeType } from "Types";


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

   

      const timer = setTimeout(() => {
        addVoronoiInfo({ nodes });
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


