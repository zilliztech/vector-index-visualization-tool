import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const HNSWForceDist = observer(() => {
  const store = useGlobalStore();
  const {visData} = store;
  return <div>{visData}</div>;
});

export default HNSWForceDist;
