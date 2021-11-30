import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import IVFFlat_Project from "./IVFFlat_Project";
import IVFFlat_Voronoi from "./IVFFlat_Voronoi";
import IVFFlat_VoronoiArea from "./IVFFlat_VoronoiArea";
import HNSW_Force from "./HNSW_Force";
import HNSW_ForceDist from "./HNSW_ForceDist";

const VisComponent = observer(() => {
  const store = useGlobalStore();
  const { visType } = store;
  if (visType === "project") {
    return <IVFFlat_Project />;
  }
  if (visType === "voronoi") {
    return <IVFFlat_Voronoi />;
  }
  if (visType === "force") {
    return <HNSW_Force />;
  }
  if (visType === "force-dist") {
    return <HNSW_ForceDist />;
  }
  if (visType === 'voronoi-area') {
    return <IVFFlat_VoronoiArea />
  }
  return <div>{visType}</div>;
});

export default VisComponent;
