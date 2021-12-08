import { useEffect, useState } from "react";
import * as d3 from "d3";
import { LevelStatus } from "Types";

// 初始化，确定长宽
export const useClientRect = ({ svgId }: { svgId: string }) => {
  const [clientRect, setClientRect] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const svg = d3.select(`#${svgId}`);
    const clientRect = (svg.node() as any).getClientRects()[0];
    setClientRect(clientRect);
  }, [svgId]);
  return clientRect;
};

export const useLevelStatus = ({
  exitTime = 1000,
}: {
  enterTime: number;
  exitTime: number;
}) => {
  const [levelStatus, setLevelStatus] = useState({
    level: 0,
    status: LevelStatus.Init,
  });

  const initLevel = () => {
    setTimeout(() => {
      setLevelStatus({
        level: levelStatus.level,
        status: LevelStatus.Enter,
      });
    }, 0);
  }

  const setPreLevel = () => {
    setLevelStatus({
      level: levelStatus.level,
      status: LevelStatus.Exit,
    });
    setTimeout(() => {
      setLevelStatus({
        level: levelStatus.level - 1,
        status: LevelStatus.Init,
      });
      setTimeout(() => {
        setLevelStatus({
          level: levelStatus.level,
          status: LevelStatus.Enter,
        });
      }, 0);
    }, exitTime);
  };
  const setNextLevel = () => {
    setLevelStatus({
      level: levelStatus.level,
      status: LevelStatus.Exit,
    });
    setTimeout(() => {
      setLevelStatus({
        level: levelStatus.level + 1,
        status: LevelStatus.Init,
      });
      setTimeout(() => {
        setLevelStatus({
          level: levelStatus.level,
          status: LevelStatus.Enter,
        });
      }, 0);
    }, exitTime);

    return { levelStatus, initLevel, setPreLevel, setNextLevel };
  };
};
