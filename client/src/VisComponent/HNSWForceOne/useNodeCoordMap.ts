import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import {
  ELayoutType,
  ILevel,
  TCoord,
  ILink,
  LinkType,
  IForceNode,
} from "Types";

export const useNodeCoordMap = ({
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
          } as IForceNode)
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
          y.range([height - padding[1], padding[1]]);
        }

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
