import React, { useState, useEffect } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import {
  ILevel,
  IIVFVoronoiAreaNode,
  IIVFVoronoiAreaFineNode,
  NodeType,
} from "Types";
import { useClientRect, useLevelStatus } from "Hooks";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import { createStyles, makeStyles, Theme } from "@material-ui/core";

import { getStarPath } from "Utils";

const colorScheme = d3.schemeTableau10;

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
  const [currentLevel, setCurrentLevel] = useState(0);
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

  return (
    <div className={classes.root}>
      <svg id={svgId} width="100%" height="100%">
        {fineLevelNodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={5}
            fill={node.color}
          />
        ))}
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
          Object.assign({}, node, { x: 0, y: 0, r: 0, countP: 0, countArea: 0 })
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
      ).map((a) => a * 0.9);

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
        nodes.forEach((node) => {
          node.x = Math.max(node.r, Math.min(width - node.r, node.x));

          node.y = Math.max(node.r, Math.min(height - node.r, node.y));
        });
      });

      const timer = setTimeout(() => {
        setCoarseLevelNodes(nodes);
        setCoarseLevelForceFinished(true);
        simulation.stop();
      }, 3000);
      setComputeTimer(timer);

      return () => {
        simulation.stop();
        computeTimer && clearTimeout(computeTimer);
      };
    }
  }, [data, width, height]);

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
      const nodes = data.nodes
        .filter((node) => node.type !== NodeType.Target)
        .map((node) =>
          Object.assign({}, node, { x: 0, y: 0, r: 0, color: "#ccc" })
        ) as IIVFVoronoiAreaFineNode[];
      const clusterIdList = Array.from(
        new Set(nodes.map((node) => node.cluster_id))
      );
      const origin = [width / 2, height / 2];
      const maxR = Math.min(width, height) * 0.5;
      const angleStep = (Math.PI * 2) / clusterIdList.length;
      const clusterCenterList = clusterIdList.map((_, i) => [
        origin[0] + (maxR / 2) * Math.sin(angleStep * (i + 0.5)),
        origin[1] - (maxR / 2) * Math.cos(angleStep * (i + 0.5)),
      ]);
      const r = d3
        .scaleLinear()
        .domain(
          [
            d3.min(
              nodes.filter((node) => node.dist > 0.001),
              (node) => node.dist
            ) as number,
            (d3.max(nodes, (node) => node.dist) as number) * 0.88,
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
        const clusterOrder = clusterIdList.indexOf(node.cluster_id);
        const clusterCenter = clusterCenterList[clusterOrder];
        node.x = clusterCenter[0];
        node.y = clusterCenter[1];
        node.color = colorScheme[clusterOrder];
      });
      console.log(
        "nodes",
        nodes.map((node) => Object.assign({}, node))
      );

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "collision",
          d3
            .forceCollide()
            .radius((_) => 5)
            .strength(0.6)
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
