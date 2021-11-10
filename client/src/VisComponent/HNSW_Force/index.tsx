import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const HNSWForce = observer(() => {
  const store = useGlobalStore();
  return <div>HNSWForce</div>;
});

export default HNSWForce;
