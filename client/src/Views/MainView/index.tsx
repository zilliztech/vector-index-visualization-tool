import React from "react";
// import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import VisComponent from "VisComponent";

const MainView = observer(() => {
  // const store = useGlobalStore();
  return <VisComponent />;
});

export default MainView;
