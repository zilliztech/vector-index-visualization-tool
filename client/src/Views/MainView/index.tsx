import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";

const MainView = observer(() => {
  const store = useGlobalStore();
  return <div></div>;
});

export default MainView;
