import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const ControlView = observer(() => {
  const store = useGlobalStore();
  return <div>ControlView</div>;
});

export default ControlView;
