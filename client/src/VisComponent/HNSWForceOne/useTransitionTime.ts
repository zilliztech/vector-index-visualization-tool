import { ILevel, LinkType } from "Types";

export enum ETransType {
  Default = 0,
  Batch,
  DiffSpeed,
}

export const useTransitionTime = ({
  visData,
  searchStatus,
  interLevelGap,
  intraLevelGap,
  transType = ETransType.Default,
}: {
  visData: ILevel[];
  searchStatus: string;
  interLevelGap: number;
  intraLevelGap: number;
  transType?: ETransType;
}) => {
  let currentTime = 0;
  // key = `${level}-${node.id}`
  const nodeShowTime = {} as { [key: string]: number };
  // key = `${level}-${link.source}-${link.target}`
  const linkShowTime = {} as { [key: string]: number };
  let isPreLinkImportant = true;
  let isSourceChange = true;
  let preSource = "";
  if (searchStatus === "ok") {
    if (transType === ETransType.DiffSpeed) {
      visData.forEach((levelData, level) => {
        const links = levelData.links;
        if (links.length === 0) {
          const source = levelData.nodes[0].id;
          const sourceId = `node-${level}-${source}`;
          nodeShowTime[sourceId] = currentTime;
        }
        links.forEach((link) => {
          const { source, target, type } = link;
          const sourceId = `node-${level}-${source}`;
          const targetId = `node-${level}-${target}`;
          const linkId = `link-${level}-${source}-${target}`;
          const isCurrentLinkImportant =
            type === LinkType.Searched || type === LinkType.Fine;
          isSourceChange = preSource !== source;
          preSource = source;

          if (!(sourceId in nodeShowTime)) {
            if (level > 0) {
              const intraLinkId = `intra-level-${level}`;
              linkShowTime[intraLinkId] = currentTime;
              currentTime += intraLevelGap;
              isPreLinkImportant = true;
              nodeShowTime[sourceId] = currentTime;
            } else {
              nodeShowTime[sourceId] = currentTime;
            }
          }

          if (isPreLinkImportant || isCurrentLinkImportant || isSourceChange) {
            currentTime += interLevelGap;
          } else {
            currentTime += interLevelGap * 0.5;
          }

          if (!(linkId in linkShowTime)) {
            linkShowTime[linkId] = currentTime;
          } else {
            console.log("link depulicate", level, link);
          }

          if (!(targetId in nodeShowTime)) {
            nodeShowTime[targetId] = currentTime + interLevelGap;
          }

          isPreLinkImportant = isCurrentLinkImportant;
        });
        currentTime += interLevelGap;
        isPreLinkImportant = true;
        isSourceChange = true;
      });
    } else if (transType === ETransType.Batch) {
      visData.forEach((levelData, level) => {
        const links = levelData.links;
        if (links.length === 0) {
          const source = levelData.nodes[0].id;
          const sourceId = `node-${level}-${source}`;
          nodeShowTime[sourceId] = currentTime;
        }
        links.forEach((link) => {
          const { source, target, type } = link;
          const sourceId = `node-${level}-${source}`;
          const targetId = `node-${level}-${target}`;
          const linkId = `link-${level}-${source}-${target}`;
          const isCurrentLinkImportant =
            type === LinkType.Searched || type === LinkType.Fine;
          isSourceChange = preSource !== source;
          preSource = source;

          if (!(sourceId in nodeShowTime)) {
            if (level > 0) {
              const intraLinkId = `intra-level-${level}`;
              linkShowTime[intraLinkId] = currentTime;
              currentTime += intraLevelGap;
              isPreLinkImportant = true;
              nodeShowTime[sourceId] = currentTime;
            } else {
              nodeShowTime[sourceId] = currentTime;
            }
          }

          if (isPreLinkImportant || isCurrentLinkImportant || isSourceChange) {
            currentTime += interLevelGap;
          }

          if (!(linkId in linkShowTime)) {
            linkShowTime[linkId] = currentTime;
          } else {
            console.log("link depulicate", level, link);
          }

          if (!(targetId in nodeShowTime)) {
            nodeShowTime[targetId] = currentTime + interLevelGap;
          }

          isPreLinkImportant = isCurrentLinkImportant;
        });
        currentTime += interLevelGap;
        isPreLinkImportant = true;
        isSourceChange = true;
      });
    } else {
      visData.forEach((levelData, level) => {
        const links = levelData.links;
        if (links.length === 0) {
          const source = levelData.nodes[0].id;
          const sourceId = `node-${level}-${source}`;
          nodeShowTime[sourceId] = currentTime;
        }
        links.forEach((link) => {
          const { source, target, type } = link;
          const sourceId = `node-${level}-${source}`;
          const targetId = `node-${level}-${target}`;
          const linkId = `link-${level}-${source}-${target}`;
          if (!(sourceId in nodeShowTime)) {
            if (level > 0) {
              const intraLinkId = `intra-level-${level}`;
              linkShowTime[intraLinkId] = currentTime;
              currentTime += intraLevelGap;
              nodeShowTime[sourceId] = currentTime;
            } else {
              nodeShowTime[sourceId] = currentTime;
            }
          }
          if (!(linkId in linkShowTime)) {
            linkShowTime[linkId] = currentTime;
          } else {
            console.log("link depulicate", level, link);
          }
          currentTime += interLevelGap;
          if (!(targetId in nodeShowTime)) {
            nodeShowTime[targetId] = currentTime;
          }
        });
      });
    }
  }

  return { nodeShowTime, linkShowTime };
};
