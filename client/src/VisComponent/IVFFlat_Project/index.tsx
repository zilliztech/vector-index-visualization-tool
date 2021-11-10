import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const IVFFlat_Project = observer(() => {
  const store = useGlobalStore();
  return <div>IVFFlat_Project</div>;
});

export default IVFFlat_Project;
