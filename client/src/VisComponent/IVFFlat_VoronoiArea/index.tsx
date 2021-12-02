import React, { useState, useEffect } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { ILevel, IIVFVoronoiAreaNode, NodeType } from "Types";
import { useClientRect } from "Hooks";

import { getStarPath } from "Utils";

const IVFFlat_VoronoiArea = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "ivf_flat_voronoi_svg";
  const [currentLevel, setCurrentLevel] = useState(0);
  const { width, height } = useClientRect({ svgId });
  if (searchStatus !== "ok") {
    return <svg id={svgId} width="100%" height="100%"></svg>;
  }

  return (
    <svg id={svgId} width="100%" height="100%">
      {currentLevel === 0 ? (
        <CoarseLevel
          key="coarse-level"
          data={visData[0]}
          width={width}
          height={height}
        />
      ) : (
        <FineLevel />
      )}
      {/* <rect
        x="0"
        y="0"
        width="20"
        height="20"
        fill="#ccc"
        onClick={() => setCurrentLevel(0)}
      />
      <rect
        x="30"
        y="0"
        width="20"
        height="20"
        fill="#ccc"
        onClick={() => setCurrentLevel(1)}
      /> */}
    </svg>
  );
});

export default IVFFlat_VoronoiArea;

const useCoarseNodes = ({
  data,
  width,
  height,
}: {
  data: ILevel;
  width: number;
  height: number;
}) => {
  const [coarseNodes, setCoarseNodes] = useState<IIVFVoronoiAreaNode[]>([]);
  const [finished, setFinished] = useState(false);
  const [computeTimer, setComputeTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    setFinished(false);
    computeTimer && clearTimeout(computeTimer);

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
      setCoarseNodes(nodes);
      setFinished(true);
      simulation.stop();
    }, 3000);
    setComputeTimer(timer);

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  return { finished, nodes: coarseNodes };
};

export const CoarseLevel = ({
  data,
  width,
  height,
}: {
  data: ILevel;
  width: number;
  height: number;
}) => {
  const { nodes, finished } = useCoarseNodes({ data, width, height });

  if (!finished) {
    return <g></g>;
  }

  const centroidNodes = nodes;
  const fineNodes = nodes.filter((node) => node.type === NodeType.Fine);
  const targetNodes = data.nodes.filter(
    (node) => node.type === NodeType.Target
  ) as IIVFVoronoiAreaNode[];
  targetNodes.forEach((targetNode) => {
    targetNode.x =
      fineNodes.reduce((acc, node) => acc + node.x, 0) / fineNodes.length;
    targetNode.y =
      fineNodes.reduce((acc, node) => acc + node.y, 0) / fineNodes.length;
  });

  const delaunay = d3.Delaunay.from(
    centroidNodes.map((node) => [node.x, node.y])
  );
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  const paths = {} as { [key: string | number]: string };
  const cells = centroidNodes.map((node, i) => [
    [node.x, node.y],
    voronoi.cellPolygon(i),
  ]);
  const cellCentroids = cells.map(([d, cell]) => d3.polygonCentroid(cell as any));

  centroidNodes.forEach((node, i) => {
    paths[node.id] = voronoi.renderCell(i);
  });

  const stroke = (node: IIVFVoronoiAreaNode) => {
    if (node.type === NodeType.Fine) {
      return "#43a2ca";
    } else {
      return "#fff";
    }
  };

  return (
    <g id="coarse-search-g">
      <g id="path-g">
        {centroidNodes.map((node, i) => (
          <g key={node.id}>
            <path
              id={node.id}
              d={paths[node.id]}
              fill="#ccc"
              stroke="#fff"
              strokeWidth="3"
              opacity="0.6"
            />
            {/* <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="none"
              stroke="#aaa"
            /> */}
            {/* <circle
              cx={node.x}
              cy={node.y}
              r={3}
              fill="#e6550d"
            /> */}
            {/* <circle 
              cx={cellCentroids[i][0]}
              cy={cellCentroids[i][1]}
              r={3}
              fill="#a8ddb5"
            /> */}
            {/* <text
              x={node.x}
              y={node.y}
              transform="translate(0,3)"
              textAnchor="middle"
              // fill={node.count > 200 ? "red": "black"}
            >
              {node.count}
            </text> */}
          </g>
        ))}
        {centroidNodes
          .filter((node) => node.type === NodeType.Fine)
          .map((node) => (
            <path
              key={node.id}
              id={node.id}
              d={paths[node.id]}
              fill="none"
              stroke={stroke(node)}
              strokeWidth="3"
              opacity="1"
            />
          ))}
      </g>
      <g id="target">
        {targetNodes.map((targetNode) => (
          <path
            key={targetNode.id}
            d={getStarPath(targetNode.x, targetNode.y, 40)}
            fill="#fc8d59"
          />
        ))}
      </g>
    </g>
  );
};

export const FineLevel = () => {
  return <g></g>;
};
