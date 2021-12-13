import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import IVFFlatProject from "./IVFFlatProject";
import IVFFlatVoronoi from "./IVFFlatVoronoi";
import IVFFlatVoronoiArea from "./IVFFlatVoronoiArea/index-new";
import HNSWForce from "./HNSWForce";
import HNSWForceDist from "./HNSWForceDist";
import HNSWForceOne from "./HNSWForceOne";

const VisComponent = observer(() => {
  const store = useGlobalStore();
  const { visType } = store;
  if (visType === "project") {
    return <IVFFlatProject />;
  }
  if (visType === "voronoi") {
    return <IVFFlatVoronoi />;
  }
  if (visType === "force") {
    return <HNSWForce />;
  }
  if (visType === "force-dist") {
    return <HNSWForceDist />;
  }
  if (visType === 'voronoi-area') {
    return <IVFFlatVoronoiArea />
  }
  if (visType === 'force-one') {
    return <HNSWForceOne />
  }
  return <div>{visType}</div>;
});

export default VisComponent;
