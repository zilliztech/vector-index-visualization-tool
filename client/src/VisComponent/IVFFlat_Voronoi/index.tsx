import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { Delaunay } from "d3-delaunay";

const IVFFlat_Voronoi = observer(() => {
  const store = useGlobalStore();
  const { visData } = store;
  console.log('visData', visData);
  const points = [
    [0, 0],
    [0, 1],
    [34, 78],
    [76,16],
    [38, 11],
    [1, 0],
    [1, 1],
  ];
  const delaunay = Delaunay.from(points);
  console.log('delaunay', delaunay);
  const voronoi = delaunay.voronoi([0, 0, 960, 500]);
  console.log('voronoi', voronoi);

  return <div>IVFFlat_Voronoi</div>;
});

export default IVFFlat_Voronoi;


export const CoarseLevel = () => {}
