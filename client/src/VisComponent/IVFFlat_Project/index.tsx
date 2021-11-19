import React from "react";
import { useGlobalStore } from "Store";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { INodesData, TNodeProjection, NodeType } from "Types";
import * as d3 from "d3";
import { transition } from "d3";
import { get_image_url } from "Server";

const colors = d3.schemeTableau10;

const fadeTime = 2;
const inTime = 2;
const translateTime = 3;

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

        color: new Array(visData.length).fill("#aaa"),
        opacity: new Array(visData.length).fill(0),
        size: new Array(visData.length).fill(5),
        shape: new Array(visData.length).fill("circle"),
        transition: new Array(visData.length).fill(""),
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

        if (node.type === NodeType.Fine) {
          nodesDataDict[node.id].color[level] = "red";
        }
        if (node.type !== NodeType.None) {
          nodesDataDict[node.id].opacity[level] = 1;
        }
        // if (node.type === NodeType.None) {
        //   nodesDataDict[node.id].transition[
        //     level
        //   ] += `cx ${translateTime}s ease-in-out 0s, cy ${translateTime}s ease-in-out 0s, `;
        // }

        // nodesDataDict[node.id].transition[
        //   level
        // ] += `opacity ${fadeTime}s linear ${translateTime}s`;
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
    currentLevel: 0,
    setCurrentLevel(level: number) {
      this.currentLevel = level;
    },
    showImage: false,
    setShowImage() {
      this.showImage = !this.showImage;
    },
  }));

  const level = localStore.currentLevel;
  const showImage = localStore.showImage;

  const clusterMap = Array.from(
    new Set(
      nodesData
        .filter((node) => (node.cluster_id[level] as number) >= 0)
        .map((node) => node.cluster_id[level])
    )
  );

  nodesData.forEach((nodeData) => {
    const color =
      nodeData.cluster_id[level] >= 0
        ? colors[clusterMap.indexOf(nodeData.cluster_id[level])]
        : "#999";
    nodeData.color[level] = color;
  });

  if (level === 1) {
    nodesData.forEach((nodeData) => {
      // 消失
      if (nodeData.type[level] === NodeType.None) {
        nodeData.opacity[level] = 0;
        // 延迟移动！！！
        nodeData.transition[level] =
          `opacity ${fadeTime}s linear 0.5s, ` +
          `cx 0s ease-in-out ${fadeTime}s, ` +
          `cy 0s ease-in-out ${fadeTime}s`;
      }
      // 出现
      else {
        nodeData.opacity[level] = 1;
        nodeData.transition[level] =
          `opacity ${inTime}s linear ${fadeTime}s, ` +
          `cx ${translateTime}s ease-in-out ${fadeTime + inTime}s, ` +
          `cy ${translateTime}s ease-in-out ${fadeTime + inTime}s`;
      }
    });
  }

  if (level === 0) {
    nodesData.forEach((nodeData) => {
      // 消失
      if (nodeData.type[level] === NodeType.None) {
        nodeData.opacity[level] = 0;
        // 延迟变色！！！
        nodeData.transition[level] =
          `cx ${translateTime}s ease-in-out 0s, ` +
          `cy ${translateTime}s ease-in-out 0s, ` +
          `opacity ${fadeTime}s linear ${translateTime}s, ` +
          `fill 0s linear ${translateTime}s`;
      }
      // 出现
      else {
        nodeData.opacity[level] = 1;
        nodeData.transition[
          level
        ] = `opacity ${inTime}s linear ${translateTime}s, `;
      }
    });
  }

  console.log("nodesData", nodesData);

  // image show
  const showImageNodes = [] as INodesData[];
  const showP = () => Math.random() < 0.7;
  const imgWidth = 80;
  const isCovered = (node: INodesData) =>
    showImageNodes.some((n) => {
      return (
        Math.abs(
          x[level](node.projection[level][0]) - x[level](n.projection[level][0])
        ) < imgWidth &&
        Math.abs(
          y[level](node.projection[level][1]) - y[level](n.projection[level][1])
        ) < imgWidth
      );
    });
  const isShowed = (node: INodesData) => {
    if (node.type[1] === NodeType.Fine) {
      return true;
    } else {
      return !isCovered(node) && showP();
    }
  };
  if (level === 1) {
    nodesData
      .filter((nodeData) => nodeData.type[1] === NodeType.Fine)
      .forEach((nodeData) => {
        showImageNodes.push(nodeData);
      });
    nodesData
      .filter(
        (nodeData) =>
          nodeData.type[1] !== NodeType.Fine && nodeData.id.indexOf(".jpg") >= 0
      )
      .forEach((nodeData) => {
        console.log(nodeData.id);
        if (isShowed(nodeData)) {
          console.log("ok", nodeData.id);
          showImageNodes.push(nodeData);
        }
      });
  }
  const getOutline = (node: INodesData) => {
    const borderWidth = node.type[level] === NodeType.Fine ? 3 : 0;
    return `${borderWidth}pt solid ${node.color[level]}`;
  };

  return (
    <svg id={svgId} width="100%" height="100%">
      {nodesData.map((node, i) => (
        <circle
          key={node.id}
          id={node.id}
          cx={x[level](node.projection[level][0])}
          cy={y[level](node.projection[level][1])}
          r={i === 1000 ? 20 : 3}
          fill={node.color[level]}
          opacity={node.opacity[level]}
          style={{
            transition: `${node.transition[level]}`,
          }}
        />
      ))}
      {showImage && (
        <g>
          {showImageNodes.map((node) => (
            <image
              key={node.id}
              xlinkHref={get_image_url(node.id)}
              x={x[level](node.projection[level][0]) - imgWidth / 2}
              y={y[level](node.projection[level][1]) - imgWidth / 2}
              height={imgWidth}
              width={imgWidth}
              filter={`drop-shadow(0 0 30pt ${node.color[level]})`}
              style={{
                outline: getOutline(node),
                transition: "all 0s ease 10s",
              }}
              preserveAspectRatio="xMinYMin slice"
            />
          ))}
        </g>
      )}

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
      <rect
        x="80"
        y="0"
        width="20"
        height="20"
        fill="#aaa"
        onClick={() => localStore.setShowImage()}
      />
    </svg>
  );
});
