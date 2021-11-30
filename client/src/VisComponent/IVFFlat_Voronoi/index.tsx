import React, { useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { ILevel, IIVFNode, NodeType } from "Types";
import { useClientRect } from "Hooks";

import { getStarPath } from "Utils";

const IVFFlat_Voronoi = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "ivf_flat_voronoi_svg";
  const [currentLevel, setCurrentLevel] = useState(0);
  const { width, height } = useClientRect({ svgId });
  if (searchStatus !== "ok") {
    return <svg id={svgId} width="100%" height="100%"></svg>;
  }
  // console.log('visData', visData);
  // const points = [
  //   [0, 0],
  //   [0, 1],
  //   [34, 78],
  //   [76,16],
  //   [38, 11],
  //   [1, 0],
  //   [1, 1],
  // ];
  // const delaunay = Delaunay.from(points);
  // console.log('delaunay', delaunay);
  // const voronoi = delaunay.voronoi([0, 0, 960, 500]);
  // console.log('voronoi', voronoi);

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
      <rect
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
      />
    </svg>
  );
});

export default IVFFlat_Voronoi;

export const CoarseLevel = ({
  data,
  width,
  height,
}: {
  data: ILevel;
  width: number;
  height: number;
}) => {
  const nodes = data.nodes.map((node) =>
    Object.assign({}, node, { x: 0, y: 0 })
  ) as IIVFNode[];

  const x = d3
    .scaleLinear()
    .domain(d3.extent(nodes, (node) => node.projection[0]) as [number, number])
    .nice()
    .range([0, width]);
  const y = d3
    .scaleLinear()
    .domain(d3.extent(nodes, (node) => node.projection[1]) as [number, number])
    .nice()
    .range([height, 0]);

  nodes.forEach((node) => {
    node.x = x(node.projection[0]);
    node.y = y(node.projection[1]);
  });

  const centroidNodes = nodes.filter((node) => node.type !== NodeType.Target);
  const targetNodes = nodes.filter((node) => node.type === NodeType.Target);

  const delaunay = d3.Delaunay.from(
    centroidNodes.map((node) => [node.x, node.y])
  );
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  const paths = {} as { [key: string | number]: string };
  centroidNodes.forEach((node, i) => {
    paths[node.id] = voronoi.renderCell(i);
  });

  const stroke = (node: IIVFNode) => {
    if (node.type === NodeType.Fine) {
      return "#43a2ca";
    } else {
      return "#fff";
    }
  };

  // console.log(nodes.find((node) => node.type === NodeType.Target));

  return (
    <g id="coarse-search-g">
      <g id="path-g">
        {centroidNodes.map((node) => (
          <g key={node.id}>
          <path
            id={node.id}
            d={paths[node.id]}
            fill="#ccc"
            stroke="#fff"
            strokeWidth="2"
            opacity="0.6"
          />
          {/* <circle cx={node.x} cy={node.y} r={3} fill="#ccc" /> */}
          <text x={node.x} y={node.y} transform="translate(0,3)" textAnchor="middle">
            {node.count}
          </text>
          </g>
        ))}
        {centroidNodes
          .filter((node) => node.type === NodeType.Fine)
          .map((node) => (
            <path
              id={node.id}
              d={paths[node.id]}
              fill="none"
              stroke={stroke(node)}
              strokeWidth="2"
              opacity="1"
            />
          ))}
      </g>
      <g id="target">
        {targetNodes.map((targetNode) => (
          <path
            key={targetNode.id}
            d={getStarPath(targetNode.x, targetNode.y, 30)}
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
