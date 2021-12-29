import { IIVFVoronoiAreaNode, TCoord } from "Types";
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

export const addCentroidOrder = ({
  nodes,
  width,
  height,
  origin,
}: {
  nodes: IIVFVoronoiAreaNode[];
  width: number;
  height: number;
  origin: TCoord;
}) => {
  const clusterIdList = vecCmp(nodes, "cluster_id");
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
