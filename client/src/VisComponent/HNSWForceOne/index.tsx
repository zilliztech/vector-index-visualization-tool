import React, { useEffect, useState } from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { useClientRect } from "Hooks";
import { INode, ILink, NodeType, LinkType } from "Types";
import { useTransform } from "./useTransform";
import { useNodeCoordMap } from "./useNodeCoordMap";
import { useTransitionTime, ETransType } from "./useTransitionTime";
import * as d3 from "d3";

const angleXYs = [
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
];

const HNSWForceOne = observer(() => {
  const store = useGlobalStore();
  const { visData, searchStatus } = store;
  const svgId = "hnsw_all_in_one_svg";
  const { width, height } = useClientRect({ svgId });
  const forceWidth = width;
  const forceHeight = visData.length > 0 ? height : height / visData.length;

  const { transform, levelMapCoords } = useTransform({
    width,
    height,
    forceWidth,
    forceHeight,
    visData,
    searchStatus,
    xBias: 0.63,
    yBias: 0.7,
    yOver: 0.35,
  });

  const { nodeCoordMap, layoutFinished } = useNodeCoordMap({
    width: forceWidth,
    height: forceHeight,
    visData,
    searchStatus,
  });

  const interLevelGap = 800;
  const intraLevelGap = 1000;
  const linkFadeTime = 1200;
  const { nodeShowTime, linkShowTime } = useTransitionTime({
    visData,
    searchStatus,
    interLevelGap,
    intraLevelGap,
    transType: ETransType.DiffSpeed,
  });

  const targetCoord = nodeCoordMap["target"] || [
    forceWidth / 2,
    forceHeight / 2,
  ];

  useEffect(() => {
    if (layoutFinished) {
      visData.forEach((levelData, level) => {
        const { nodes, links } = levelData;
        nodes.forEach((node) => {
          const nodeId = `node-${level}-${node.id}`;
          d3.select(`#${nodeId}`)
            .transition()
            .duration(interLevelGap * 0)
            .delay(nodeShowTime[nodeId])
            .attr("opacity", 1)
            .on("end", function () {
              if (node.type === NodeType.Coarse) {
                d3.select(this)
                  .transition()
                  .duration(linkFadeTime)
                  .attr("opacity", 0.3);
              }
            });
        });
        links.forEach((link) => {
          const { source, target, type } = link;
          const t = transform(nodeCoordMap[target], level);
          const linkId = `link-${level}-${source}-${target}`;
          d3.select(`#${linkId}`)
            .transition()
            .duration(0)
            .delay(linkShowTime[linkId])
            .attr("opacity", 0.6)
            .on("end", function () {
              d3.select(this)
                .transition()
                .duration(interLevelGap)
                .attr("x2", t[0])
                .attr("y2", t[1])
                .on("end", function () {
                  if (type === LinkType.Visited || type === LinkType.Extended) {
                    d3.select(this)
                      .transition()
                      .duration(linkFadeTime)
                      .attr(
                        "opacity",
                        level === visData.length - 1 ? 0.05 : 0.2
                      );
                  }
                });
            });
        });
        const intraLevelLinkId = `intra-level-${level}`;
        const t = transform(nodeCoordMap[levelData.entry_ids[0]], level);
        d3.select(`#${intraLevelLinkId}`)
          .transition()
          .duration(intraLevelGap)
          .delay(linkShowTime[intraLevelLinkId])
          .attr("x2", t[0] + 0.01)
          .attr("y2", t[1]);
      });
    }
  }, [layoutFinished]);

  const getLineGradient = (link: ILink) => {
    const { source, target } = link;
    const sourceCoord = transform(nodeCoordMap[source], 0);
    const targetCoord = transform(nodeCoordMap[target], 0);
    const _x = targetCoord[0] - sourceCoord[0];
    const _y = sourceCoord[1] - targetCoord[1];
    let angle = (Math.atan(_x / _y) / Math.PI) * 180;
    if (angle < 0) {
      if (targetCoord[0] < sourceCoord[0]) {
        angle += 360;
      } else {
        angle += 180;
      }
    } else {
      if (targetCoord[0] < sourceCoord[0]) {
        angle += 180;
      }
    }
    const angleSlice = 45;
    const angleN = Math.floor((angle + angleSlice / 2) / angleSlice);
    let standardAngle = angleN * angleSlice;
    if (standardAngle === 360) {
      standardAngle = 0;
    }
    return `url('#line-gradient-${standardAngle}')`;
  };

  const getNodeR = (node: INode, level: number) => {
    if (node.type === NodeType.Fine && level === visData.length - 1) {
      return 5;
    }
    if (node.type === NodeType.Fine || node.type === NodeType.Candidate) {
      return 4;
    }
    return 2;
  };

  const getNodeFill = (node: INode, level: number) => {
    if (node.type === NodeType.Fine && level === visData.length - 1) {
      return `url(#fine-gradient)`;
    }
    if (node.type === NodeType.Fine || node.type === NodeType.Candidate) {
      return "url(#line-gradient-135)";
    }
    return "#fff";
  };

  return (
    <svg
      id={svgId}
      width="100%"
      height="100%"
      style={{ backgroundColor: "#000", visibility: "visible" }}
    >
      <defs>
        {angleXYs.map((angle, i) => (
          <linearGradient
            id={`line-gradient-${i * 45}`}
            // gradientTransform="rotate(90)"
            // gradientUnits="userSpaceOnUse"
            x1={angle[0]}
            y1={angle[1]}
            x2={angle[2]}
            y2={angle[3]}
          >
            <stop offset="5%" stop-color="#06F3AF" />
            <stop offset="95%" stop-color="#DBFFF5" />
          </linearGradient>
        ))}
        <linearGradient id={`fine-gradient`} x1={0} y1={0} x2={1} y2={1}>
          <stop offset="5%" stop-color="#06AFF2" />
          <stop offset="95%" stop-color="#CCF1FF" />
        </linearGradient>
        <linearGradient id={`target-gradient`} x1={0} y1={0} x2={1} y2={1}>
          <stop offset="5%" stop-color="#f03b20" />
          <stop offset="95%" stop-color="#E3E1FF" />
        </linearGradient>
        <filter id="blur" x="0" y="0">
          <feGaussianBlur stdDeviation="5" result="offset-blur" />
          <feComposite
            operator="out"
            in="SourceGraphic"
            in2="offset-blur"
            result="inverse"
          />
          <feFlood flood-color="#444" flood-opacity=".95" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>
      {[...visData].reverse().map((levelData, _level) => {
        const level = visData.length - 1 - _level;
        return (
          <g key={level} id={`level-${level}`}>
            {levelMapCoords[level].length > 0 && (
              <path
                id="border"
                d={`M${levelMapCoords[level]
                  .map((coord) => `${coord}`)
                  .join("L")}Z`}
                fill="#222"
                opacity="0.8"
                filter={`url(#blur)`}
              />
            )}
            {layoutFinished && (
              <>
                {level > 0 && (
                  <line
                    key={`intra-level-${level}`}
                    id={`intra-level-${level}`}
                    fill="none"
                    opacity="0.7"
                    stroke="url('#line-gradient-180')"
                    // stroke="red"
                    strokeWidth="8"
                    strokeLinecap="round"
                    x1={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[0]
                    }
                    y1={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[1]
                    }
                    x2={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[0]
                    }
                    y2={
                      transform(
                        nodeCoordMap[levelData.entry_ids[0]],
                        level - 1
                      )[1]
                    }
                  />
                )}
                <g id="links-g">
                  {levelData.links.map(
                    (link) =>
                      link.source in nodeCoordMap &&
                      link.target in nodeCoordMap && (
                        <line
                          key={`link-${level}-${link.source}-${link.target}`}
                          id={`link-${level}-${link.source}-${link.target}`}
                          fill="none"
                          opacity="0"
                          strokeLinecap="round"
                          stroke={
                            link.type === LinkType.Searched ||
                            link.type === LinkType.Fine
                              ? getLineGradient(link)
                              : "#ddd"
                          }
                          strokeWidth={
                            link.type === LinkType.Searched ||
                            link.type === LinkType.Fine
                              ? 7
                              : 1
                          }
                          x1={transform(nodeCoordMap[link.source], level)[0]}
                          y1={transform(nodeCoordMap[link.source], level)[1]}
                          x2={transform(nodeCoordMap[link.source], level)[0]}
                          y2={transform(nodeCoordMap[link.source], level)[1]}
                        />
                      )
                  )}
                </g>
                <g id="circles-g">
                  {levelData.nodes.map((node) => (
                    <ellipse
                      key={node.id}
                      id={`node-${level}-${node.id}`}
                      opacity={0}
                      cx={transform(nodeCoordMap[node.id], level)[0]}
                      cy={transform(nodeCoordMap[node.id], level)[1]}
                      fill={getNodeFill(node, level)}
                      rx={getNodeR(node, level) + 1}
                      ry={getNodeR(node, level)}
                    />
                  ))}
                </g>
                {/* {level >= visData.length - 1 && (
                  <g id="target-g">
                    <ellipse
                      cx={transform(targetCoord, level)[0]}
                      cy={transform(targetCoord, level)[1]}
                      fill="url(#target-gradient)"
                      rx={5}
                      ry={4}
                    />
                  </g>
                )} */}
                <g id="target-g">
                  {level > 0 && (
                    <line
                      fill="none"
                      stroke="#ccc"
                      strokeWidth="2"
                      opacity="0.5"
                      x1={transform(targetCoord, level)[0]}
                      y1={transform(targetCoord, level)[1]}
                      x2={transform(targetCoord, level - 1)[0]}
                      y2={transform(targetCoord, level - 1)[1]}
                      strokeDasharray={5}
                    />
                  )}
                  {(
                    <ellipse
                      cx={transform(targetCoord, level)[0]}
                      cy={transform(targetCoord, level)[1]}
                      fill="url(#target-gradient)"
                      rx={5}
                      ry={4}
                    />
                  )}
                </g>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
});

export default HNSWForceOne;
