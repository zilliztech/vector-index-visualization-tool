import React from "react";
import { useGlobalStore } from "Store";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { INodesData, TNodeProjection, NodeType } from "Types";
import * as d3 from "d3";

const IVFFlat_Project = observer(() => {
  const rand = () => (Math.random() - 0.5) * 10 * 0.01;
  const store = useGlobalStore();
  const { visData, searchStatus } = store;

  if (searchStatus !== "ok") return <svg width="100%" height="100%"></svg>;

  const allNodeIdSet = new Set([
    ...visData[0].nodes.map((node) => node.id),
    ...visData[1].nodes.map((node) => node.id),
  ]);
  const allNodeIds = Array.from(allNodeIdSet);

  const nodesDataDict = {} as { [key: string]: INodesData };
  allNodeIds.forEach(
    (node_id) =>
      (nodesDataDict[node_id] = {
        id: node_id,
        type: new Array(visData.length).fill(NodeType.None),
        projection: new Array(visData.length).fill([0, 0]),
        isEntry: new Array(visData.length).fill(false),
        cluster_id: new Array(visData.length).fill(-1),
      })
  );

  for (let level = 0; level < visData.length; level++) {
    const levelData = visData[level];
    const { entry_ids, fine_ids, nodes } = levelData;
    if (level === 0) {
      nodes.forEach((node) => {
        nodesDataDict[node.id].type[level] = node.type;
        nodesDataDict[node.id].projection = new Array(visData.length).fill(
          (node.projection as TNodeProjection).map(
            (num) => num
          ) as TNodeProjection
        );

        nodesDataDict[node.id].isEntry[level] = entry_ids.indexOf(node.id) >= 0;
        nodesDataDict[node.id].cluster_id[level] = node.cluster_id || -1;
      });
    }
    if (level === 1) {
      nodes.forEach((node) => {
        nodesDataDict[node.id].projection[level] = [
          ...(node.projection as TNodeProjection),
        ];
        if (node.id === "target") {
        } else {
          nodesDataDict[node.id].projection[level - 1] = nodesDataDict[
            `centroid-${node.cluster_id}`
          ].projection[level - 1].map(
            (num: number) => num + rand()
          ) as TNodeProjection;
        }

        nodesDataDict[node.id].type[level] = node.type;
        nodesDataDict[node.id].isEntry[level] = entry_ids.indexOf(node.id) >= 0;
        nodesDataDict[node.id].cluster_id[level] = node.cluster_id || -1;
      });
    }
  }

  const nodesData = Object.values(nodesDataDict);

  return <View nodesData={nodesData} />;
});

export default IVFFlat_Project;

const View = observer(({ nodesData }: { nodesData: INodesData[] }) => {
  const svgId = "ivf_flat_project_svg";
  const { width = 0, height = 0 } = useClientRect({ svgId });
  const padding = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };

  const x = d3.range(0, 2).map((level) =>
    d3
      .scaleLinear()
      .domain(
        d3.extent(
          nodesData.filter(
            (nodeData) => nodeData.type[level] !== NodeType.None
          ),
          (nodeData) => nodeData.projection[level][0]
        ) as [number, number]
      )
      .nice()
      .range([padding.left, width - padding.right])
  );

  const y = d3.range(0, 2).map((level) =>
    d3
      .scaleLinear()
      .domain(
        d3.extent(
          nodesData.filter(
            (nodeData) => nodeData.type[level] !== NodeType.None
          ),
          (nodeData) => nodeData.projection[level][1]
        ) as [number, number]
      )
      .nice()
      .range([padding.top, height - padding.bottom])
  );

  const localStore = useLocalObservable(() => ({
    currentLevel: 1,
    setCurrentLevel(level: number) {
      this.currentLevel = level;
    },
  }));

  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{
        transition: "all 1s ease",
      }}
    >
      {nodesData.map((node) => (
        <circle
          key={node.id}
          id={node.id}
          cx={x[localStore.currentLevel](
            node.projection[localStore.currentLevel][0]
          )}
          cy={y[localStore.currentLevel](
            node.projection[localStore.currentLevel][1]
          )}
          r="3"
          fill={"red"}
        />
      ))}
      <rect
        x="0"
        y="0"
        width="20"
        height="20"
        fill="#ccc"
        onClick={() => localStore.setCurrentLevel(0)}
      />
      <rect
        x="30"
        y="0"
        width="20"
        height="20"
        fill="#ccc"
        onClick={() => localStore.setCurrentLevel(1)}
      />
    </svg>
  );
});
