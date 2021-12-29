import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { NodeType, LevelStatus, TCoord } from "Types";
import { useClientRect, useLevelStatus } from "Hooks";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useCoarseLevelNodes } from "./useCoarseLevelNodes";
import { useFineLevelNodes } from "./useFineLevelNodes";
import { useTargetNode } from "./useTargetNode";
import { addCentroidOrder } from "./addCentroidOrder";

import * as d3 from "d3";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
  })
);

const IVFFlatVoronoiArea = observer(() => {
  const store = useGlobalStore();
  const classes = useStyles();
  const svgId = "ivf_flat_voronoi_area_svg";
  const { visData, searchStatus } = store;

  const { width, height } = useClientRect({ svgId });

  const { coarsLevelForceFinished, coarseLevelNodes } = useCoarseLevelNodes({
    data: visData[0],
    searchStatus,
    width,
    height,
  });

  const targetNodeBias = 30;
  const { targetNode_CoarseLevelProjection, isTargetLeft } = useTargetNode({
    checked: coarsLevelForceFinished,
    visData,
    coarseLevelNodes,
    width,
    bias: targetNodeBias,
  });

  const origin = [width * (isTargetLeft ? 0.35 : 0.65), height / 2] as TCoord;
  const maxR = Math.min(width, height) * 0.5 - 5;

  addCentroidOrder({
    nodes: coarseLevelNodes.filter((node) => node.type === NodeType.Fine),
    width,
    height,
    origin,
    maxR,
  });

  const { fineLevelForceFinished, fineLevelNodes } = useFineLevelNodes({
    data: visData[1],
    coarseLevelNodes,
    coarsLevelForceFinished,
    searchStatus,
    width,
    height,
    origin,
    maxR,
  });

  const polarSticksNum = 4;
  const minStick = maxR * 0.15;
  const maxStick = maxR * 0.9;
  const stepStick = (maxStick - minStick) / (polarSticksNum - 1);
  const polarSticks = d3
    .range(polarSticksNum)
    .map((stick) => minStick + stepStick * stick);

  const enterTime = 1.5;
  const exitTime = 1;

  const { levelStatus, initLevel, setPreLevel, setNextLevel } = useLevelStatus({
    exitTime: exitTime * 1000,
  });

  if (
    searchStatus === "ok" &&
    coarsLevelForceFinished &&
    fineLevelForceFinished
  ) {
    initLevel();
  }

  const changeLevel = () => {
    if (levelStatus.level === 0) {
      setNextLevel();
    } else {
      setPreLevel();
    }
  };

  return (
    <div className={classes.root}>
      <svg
        id={svgId}
        width="100%"
        height="100%"
        style={{ backgroundColor: "#000" }}
      >
        {levelStatus.level === 0 && (
          <g id="coarse-level">
            {coarseLevelNodes
              .filter((node) => node.type !== NodeType.Fine)
              .map((node) => (
                <path
                  key={node.id}
                  d={node.pathD}
                  fill={"#000"}
                  stroke={"#06F3AF"}
                  strokeWidth={"1"}
                  opacity={levelStatus.status === LevelStatus.Enter ? 1 : 0}
                  style={{
                    transition: `all ${
                      levelStatus.status === LevelStatus.Enter
                        ? enterTime
                        : exitTime
                    }s ease`,
                  }}
                />
              ))}

            {coarseLevelNodes
              .filter((node) => node.type === NodeType.Fine)
              .map((node) => (
                <>
                  <path
                    key={node.id}
                    d={node.pathD}
                    fill={"#06F3AF"}
                    stroke={"#fff"}
                    strokeWidth={"3"}
                    // opacity={1}
                    opacity={levelStatus.status === LevelStatus.Enter ? 1 : 0.9}
                    transform={
                      levelStatus.status === LevelStatus.Enter
                        ? ""
                        : `translate(${node.translate[0]}, ${node.translate[1]})`
                    }
                    style={{
                      transition: `all ${
                        levelStatus.status === LevelStatus.Enter
                          ? enterTime
                          : exitTime
                      }s ease`,
                    }}
                  />
                  {/* <text key={`id-${node.id}`} x={node.x-30} y={node.y}>
                    {node.id}
                  </text> */}
                </>
              ))}

            <g id="target">
              {targetNode_CoarseLevelProjection.x > 0 && (
                <circle
                  cx={
                    levelStatus.status === LevelStatus.Enter
                      ? targetNode_CoarseLevelProjection.x
                      : origin[0]
                  }
                  cy={
                    levelStatus.status === LevelStatus.Enter
                      ? targetNode_CoarseLevelProjection.y
                      : origin[1]
                  }
                  fill="none"
                  r="11"
                  stroke="#fff"
                  strokeWidth="7"
                  style={{
                    transition: `all ${
                      levelStatus.status === LevelStatus.Enter
                        ? enterTime
                        : exitTime
                    }s ease`,
                  }}
                />
              )}
            </g>
          </g>
        )}

        {levelStatus.level === 1 && (
          <g id="fine-level">
            <g id="polar-sticks">
              {polarSticks.map((stick) => (
                <circle
                  key={`stick-${stick}`}
                  cx={origin[0]}
                  cy={origin[1]}
                  r={stick}
                  fill="none"
                  stroke="#06F3AF"
                  strokeWidth="0.3"
                  opacity={levelStatus.status === LevelStatus.Enter
                    ? 0.7
                    :0}
                  style={{
                    transition: `all ${
                      levelStatus.status === LevelStatus.Enter
                        ? enterTime
                        : exitTime
                    }s ease`,
                  }}
                />
              ))}
            </g>
            <g id="fine-centroid-cluster">
              {coarseLevelNodes
                .filter((node) => node.type === NodeType.Fine)
                .map((node) => (
                  <path
                    key={node.id}
                    id={node.id}
                    d={node.pathD}
                    // d={
                    //   levelStatus.status === LevelStatus.Enter
                    //     ? getPolarD[node.cluster_id || 0]
                    //     : node.pathD
                    // }
                    fill={"#06F3AF"}
                    stroke={"#fff"}
                    strokeWidth={"3"}
                    opacity={levelStatus.status === LevelStatus.Enter ? 0 : 0.9}
                    transform={`translate(${node.translate})`}
                    style={{
                      transition: `all ${
                        levelStatus.status === LevelStatus.Enter
                          ? enterTime
                          : exitTime
                      }s ease`,
                    }}
                    // style={{
                    //   animationName: 'path',
                    //   animationDuration: '3s'
                    // }}
                  />
                ))}
            </g>
            {fineLevelNodes.map((node) => (
              <circle
                key={node.id}
                cx={
                  levelStatus.status === LevelStatus.Enter
                    ? node.x
                    : node.centroidX
                }
                cy={
                  levelStatus.status === LevelStatus.Enter
                    ? node.y
                    : node.centroidY
                }
                // opacity={levelStatus.status === LevelStatus.Enter ? 1 : 0.3}
                opacity={node.type === NodeType.Fine ? 1 : 0.6}
                r={node.type === NodeType.Fine ? 7 : 5}
                strokeWidth={node.type === NodeType.Fine ? 1 : 0}
                stroke={"#fff"}
                fill={node.color}
                style={{
                  transition: `all ${
                    levelStatus.status === LevelStatus.Enter
                      ? enterTime
                      : exitTime
                  }s ease`,
                }}
              />
            ))}
            <g id="target">
              {targetNode_CoarseLevelProjection.x > 0 && (
                <circle
                  cx={origin[0]}
                  cy={origin[1]}
                  fill="none"
                  r="11"
                  stroke="#fff"
                  strokeWidth="7"
                />
              )}
            </g>
          </g>
        )}

        <g
          id="stepper"
          transform={`translate(${width - 50}, ${10})`}
          style={{
            cursor: "pointer",
          }}
          onClick={changeLevel}
        >
          <rect width="30" height="30" fill="#fff" />
          {levelStatus.level === 0 ? (
            <ZoomOutMapIcon width="30" height="30" />
          ) : (
            <ZoomInMapIcon width="30" height="30" />
          )}
        </g>
      </svg>
    </div>
  );
});

export default IVFFlatVoronoiArea;
