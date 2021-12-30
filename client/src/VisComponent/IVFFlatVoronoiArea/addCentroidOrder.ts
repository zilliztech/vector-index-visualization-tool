import { IIVFVoronoiAreaNode, TCoord } from "Types";
import { vecCmp, colorScheme } from "Utils";

export const addCentroidOrder = ({
  nodes,
  origin,
  maxR,
}: {
  nodes: IIVFVoronoiAreaNode[];
  width: number;
  height: number;
  origin: TCoord;
  maxR: number;
}) => {
  const clusterIdList = vecCmp(nodes, "cluster_id") as number[];
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
    const clusterOrder = clusterIdList.indexOf(node.cluster_id as number);
    node.polarPolyCentroid = clusterCenterList[clusterOrder];
    node.translate = [
      node.polarPolyCentroid[0] - node.polygonCentroid[0],
      node.polarPolyCentroid[1] - node.polygonCentroid[1],
    ];
    node.color = colorScheme[clusterOrder];
    node.polarPathD = getPolarD[node.cluster_id || 0];
  });

  return { fineClusterOrder: clusterIdList };
};
