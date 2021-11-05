import React from "react";
import { makeStyles, Theme } from "@material-ui/core";
import { StoreProvider } from "Store";
import MainView from "Views/MainView";
import ControlView from "Views/ControlView"

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: 10,
    position: 'absolute',
    width: "100%",
    height: "100%",
  },
  mainView: {
    position: 'absolute',
    right: "20%",
    left: 0,
    top: 0,
    bottom: 0,
    margin: 18,
    borderRadius: 10,
    boxShadow: "0 0 10px #aaa",
    padding: 10,
  },
  controlView: {
    position: 'absolute',
    left: "80%",
    right: 0,
    top: 0,
    bottom: 0,
    marginLeft: 5,
    borderLeft: "2px solid #aaa"
  },
}));

function App() {
  const classes = useStyles();
  return (
    <StoreProvider>
      <div className={classes.root}>
        <div className={classes.mainView}>
          <MainView />
        </div>
        <div className={classes.controlView}>
          <ControlView />
        </div>
      </div>
    </StoreProvider>
  );
}

export default App;
