import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import {
  ILevel,
  IIVFVoronoiAreaNode,
  IIVFVoronoiAreaFineNode,
  NodeType,
  TCoord,
} from "Types";
import { get } from "lodash";

export const useFineLevelNodes = ({
  data,
  coarseLevelNodes,
  coarsLevelForceFinished,
  searchStatus,
  width,
  height,
  origin,
  maxR,
}: {
  data: ILevel;
  coarseLevelNodes: IIVFVoronoiAreaNode[];
  coarsLevelForceFinished: boolean;
  searchStatus: string;
  width: number;
  height: number;
  origin: TCoord;
  maxR: number;
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
