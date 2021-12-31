import React from "react"; // , { useState }
import {
  makeStyles,
  Theme,
  // IconButton,
  // Drawer
} from "@material-ui/core";
// import MenuIcon from "@mui/icons-material/Menu";
import { StoreProvider, useGlobalStore } from "Store";
import MainView from "Views/MainView";
// import ControlView from "Views/ControlView";
import Header from "Views/Header";
import { observer } from "mobx-react-lite";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const headerHeight = 30;
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: 10,
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  mainView: {
    position: "absolute",
    right: 0,
    left: 0,
    top: headerHeight,
    bottom: 0,
    // margin: 18,
    // borderRadius: 10,
    // padding: 10,
    // boxShadow: "0 0 8px #aaa",
  },
  header: {
    position: "absolute",
    right: 0,
    left: 0,
    top: 0,
    height: headerHeight,
    backgroundColor: "#222",
  },
  controlView: {
    position: "absolute",
    left: "80%",
    right: 0,
    top: 0,
    bottom: 0,
    marginLeft: 5,
    borderLeft: "2px solid #bbb",
    boxShadow: "0 0 10px #aaa",
  },
  controlDrawer: {
    height: "100%",
  },
}));

function App() {
  return (
    <StoreProvider>
      <Views />
    </StoreProvider>
  );
}

const Views = observer(() => {
  const classes = useStyles();
  const store = useGlobalStore();
  const { searchStatus } = store;
  return (
    <div className={classes.root}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={searchStatus !== "ok"}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className={classes.header}>
        <Header />
      </div>
      <div className={classes.mainView}>
        <MainView />
      </div>
      {/* <div className={classes.controlView}>
          <ControlView />
        </div> */}
      {/* <Drawer
          className={classes.controlDrawer}
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerOpen}
        >
          <ControlView />
        </Drawer>
        <IconButton
          color="primary"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          // edge="end"
          // sx={{ mr: 2, display: "none" }}
        >
          <MenuIcon />
        </IconButton> */}
    </div>
  );
});

export default App;
