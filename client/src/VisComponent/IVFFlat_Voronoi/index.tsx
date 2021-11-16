import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const IVFFlat_Voronoi = observer(() => {
  const store = useGlobalStore();
  const { visData } = store;
  return <div>IVFFlat_Voronoi</div>;
});

export default IVFFlat_Voronoi;
