import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import IVFFlat_Project from "./IVFFlat_Project";
import HNSW_Force from "./HNSW_Force";



const VisComponent = observer(() => {
  const store = useGlobalStore();
  const { visType } = store;
  return <div>VisPanel</div>;
});

export default VisComponent;
