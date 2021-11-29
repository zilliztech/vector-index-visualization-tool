import * as d3 from "d3";

export const getStarPath = (x: number, y: number, width: number) => {
  x = x - width / 2;
  y = y - width / 2 / Math.tan((72 / 180) * Math.PI);
  const coordB = {
    x0: x + width,
    y0: y,
  };
  const coordD = {
    x0:
      x +
      width * Math.sin((36 / 180) * Math.PI) * Math.tan((18 / 180) * Math.PI),
    y0: y + width * Math.sin((36 / 180) * Math.PI),
  };
  const coordA = {
    x0: x + width / 2,
    y0: y - (width / 2) * Math.tan((36 / 180) * Math.PI),
  };
  const coordC = {
    x0: x + width * Math.cos((36 / 180) * Math.PI),
    y0: y + width * Math.sin((36 / 180) * Math.PI),
  };
  //绘制星星
  return `M${x},${y} L${coordB.x0},${coordB.y0} L${coordD.x0},${coordD.y0} L${coordA.x0},${coordA.y0} L${coordC.x0},${coordC.y0} Z`;
};

export const getPolygon = (x: number, y: number, r: number, n: number) => {
  const stepAngle = (2 * Math.PI) / n;
  const points = d3
    .range(n)
    .map(
      (i) =>
        `${x + r * Math.sin(stepAngle * i)},${y - r * Math.cos(stepAngle * i)}`
    );
  return `M${points.join("L")}`;
};