import {
  NodeType,
  IIVFVoronoiAreaNode,
  ILevel,
} from "Types";

export const useTargetNode = ({
  checked,
  visData,
  coarseLevelNodes,
  width,
  bias = 16,
}: {
  checked: boolean;
  visData: ILevel[];
  coarseLevelNodes: IIVFVoronoiAreaNode[];
  width: number;
  bias?: number;
}) => {
  if (!checked) {
    return {
      targetNode_CoarseLevelProjection: { x: -100, y: -100 },
      isTargetLeft: true,
    };
  }
  const nearestFineNodeId = visData[1].fine_ids[0];
  const nearestFineNode_fineLevel = visData[1].nodes.find(
    (node) => node.id === nearestFineNodeId
  );
  const nearestFineNode_clusterId = nearestFineNode_fineLevel?.cluster_id;
  const nearestFineNode_coarseLevel = coarseLevelNodes.find(
    (node) => node.cluster_id === nearestFineNode_clusterId
  ) as IIVFVoronoiAreaNode;
  // console.log(nearestFineNode_coarseLevel);
  const fineNodes_coarseLevel = coarseLevelNodes.filter(
    (node) => node.type === NodeType.Fine
  );
  const centerFineNode_coarseLevel = fineNodes_coarseLevel.reduce(
    (acc, node) => ({
      x: acc.x + node.x / fineNodes_coarseLevel.length,
      y: acc.y + node.y / fineNodes_coarseLevel.length,
    }),
    { x: 0, y: 0 }
  );
  // console.log(centerFineNode_coarseLevel);
  const _x =
    centerFineNode_coarseLevel.x -
    nearestFineNode_coarseLevel.polygonCentroid[0];
  const _y =
    centerFineNode_coarseLevel.y -
    nearestFineNode_coarseLevel.polygonCentroid[1];
  const r = Math.sqrt(_x * _x + _y * _y);
  const targetNode_CoarseLevelProjection = {
    x: nearestFineNode_coarseLevel.x + (_x / r) * bias,
    y: nearestFineNode_coarseLevel.y + (_y / r) * bias,
  };
  // const isTargetLeft = targetNode_CoarseLevelProjection.x < width / 2;
  const isTargetLeft = centerFineNode_coarseLevel.x < width / 2;
  return { targetNode_CoarseLevelProjection, isTargetLeft };
};
