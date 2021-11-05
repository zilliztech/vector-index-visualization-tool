import { useEffect, useState } from "react";
import * as d3 from "d3";

// 初始化，确定长宽
export const useClientRect = ({ svgId }: {svgId: string}) => {
  const [clientRect, setClientRect] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const svg = d3.select(`#${svgId}`);
    const clientRect = (svg.node() as any).getClientRects()[0];
    setClientRect(clientRect);
  }, [svgId]);
  return clientRect;
};
