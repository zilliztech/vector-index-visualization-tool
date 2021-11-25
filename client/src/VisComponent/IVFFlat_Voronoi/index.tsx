import React, { useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { ILevel, IIVFNode, NodeType } from "Types";
import { useClientRect } from "Hooks";

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
        <CoarseLevel data={visData[0]} width={width} height={height} />
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
  const nodes = data.nodes as IIVFNode[];

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

  const delaunay = d3.Delaunay.from(
    nodes.map((node: any) => [x(node.projection[0]), y(node.projection[1])])
  );
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  const paths = {} as { [key: string | number]: string };
  nodes.forEach((node, i) => {
    paths[node.id] = voronoi.renderCell(i);
  });

  const stroke = (node: IIVFNode) => {
    if (node.type === NodeType.Fine) {
      return "#43a2ca";
    } else {
      return "#fff";
    }
  };

  return (
    <g id="coarse-search-g">
      <g id="path-g">
        {nodes
          // .filter((node) => node.type !== NodeType.Fine)
          .map((node) => (
            <path
              id={node.id}
              d={paths[node.id]}
              fill="#ccc"
              stroke="#fff"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}
        {nodes
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
      {/* <g id="node-g">
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={x(node.projection[0])}
            cy={y(node.projection[1])}
            r={2}
            fill="#aaa"
          />
        ))}
      </g> */}
    </g>
  );
};

export const FineLevel = () => {
  return <g></g>;
};
