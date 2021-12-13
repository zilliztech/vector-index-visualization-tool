import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const HNSWForceOne = observer(() => {
  const store = useGlobalStore();
  const {visData} = store;
  return <div>HNSWForceOne</div>;
});

export default HNSWForceOne;
