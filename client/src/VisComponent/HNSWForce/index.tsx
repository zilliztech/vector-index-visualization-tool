import React, { useEffect, useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { LinkType, ILayoutMap, NodeType, ILevel } from "Types";
import * as d3 from "d3";
import { useClientRect } from "Hooks";
// import { CSSTransition, TransitionGroup } from "react-transition-group";
// import "./index.scss";
import { toJS } from "mobx";

const HNSWForce = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "ivf_flat_project_svg";
  const { width, height } = useClientRect({ svgId });
  const [currentLevel, setCurrentLevel] = useState(0);

  const { levelLayoutMap, isForceFinished } = useLevelLayoutMap({
    visData,
    searchStatus,
    width,
    height,
  });
  console.log("levelDataForForce", levelLayoutMap, isForceFinished);

  if (searchStatus !== "ok" || !isForceFinished)
    return <svg id={svgId} width="100%" height="100%" />;

  const LayoutMap = levelLayoutMap[currentLevel];

  const preLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
  };
  const nextLevel = () => {
    if (currentLevel < visData.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };
  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{
        transition: "all 1s ease",
      }}
    >
      {visData[currentLevel].nodes.map((node) => (
        <circle
          key={node.id}
          id={node.id}
          cx={LayoutMap[node.id][0]}
          cy={LayoutMap[node.id][1]}
          r="3"
          fill="red"
          style={{
            transition: "all 1s ease",
          }}
        />
      ))}
      <rect x="0" y="0" width="20" height="20" fill="#ccc" onClick={preLevel} />
      <rect
        x="30"
        y="0"
        width="20"
        height="20"
        fill="#ccc"
        onClick={nextLevel}
      />
      {/* <TransitionGroup>
        {visData[currentLevel].nodes.map((node) => (
          <CSSTransition key={node.id} timeout={3000} classNames="force-node">
            <circle
              key={node.id}
              cx={LayoutMap[node.id][0]}
              cy={LayoutMap[node.id][0]}
              r="20"
              fill="red"
            />
          </CSSTransition>
        ))}
      </TransitionGroup> */}
    </svg>
  );
});

export default HNSWForce;

const useLevelLayoutMap = ({
  visData,
  searchStatus,
  width,
  height,
}: {
  visData: ILevel[];
  searchStatus: string;
  width: number;
  height: number;
}) => {
  const [levelLayoutMap, setLevelLayoutMap] = useState<ILayoutMap[]>([]);
  const [isForceFinished, setIsForceFinished] = useState(false);
  const [computeTimer, setComputeTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    computeTimer && clearTimeout(computeTimer);
    setIsForceFinished(false);
    if (searchStatus === "ok" && width > 0 && height > 0) {
      let levelDataForForce = visData.reverse().map((levelData) => {
        const nodes = levelData.nodes.map((node) =>
          Object.assign({}, node, { x: 0, y: 0 })
        );
        nodes.push({
          id: "target",
          dist: 0,
          type: NodeType.Target,
          x: 0,
          y: 0,
        });
        const links = [
          ...toJS(levelData.links),
          ...levelData.fine_ids.map((fine_id) => ({
            source: fine_id,
            target: "target",
            type: LinkType.None,
          })),
        ];

        console.log("nodes and links\n==>", nodes, links);

        const simulation = d3
          .forceSimulation(nodes)
          .force(
            "link",
            d3
              .forceLink(links)
              .id((d: any) => d.id)
              .strength((d) => 1)
          )
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

        return { nodes, links, simulation };
      });
      const timer = setTimeout(() => {
        console.log("get force layout!");
        levelDataForForce.forEach((levelData) => {
          levelData.simulation.stop();
        });

        const _levelLayoutMap = levelDataForForce.map((levelData) => {
          const map = {} as ILayoutMap;

          const x = d3
            .scaleLinear()
            .domain(d3.extent(levelData.nodes, (d) => d.x) as [number, number])
            .nice()
            .range([0, width]);
          const y = d3
            .scaleLinear()
            .domain(d3.extent(levelData.nodes, (d) => d.y) as [number, number])
            .nice()
            .range([height, 0]);

          levelData.nodes.forEach((node) => {
            map[node.id] = [x(node.x), y(node.y)];
          });
          return map;
        });

        setLevelLayoutMap(_levelLayoutMap);

        setIsForceFinished(true);
      }, 5000);
      setComputeTimer(timer);
    }
  }, [visData, searchStatus, width, height]);

  return { levelLayoutMap, isForceFinished };
};
