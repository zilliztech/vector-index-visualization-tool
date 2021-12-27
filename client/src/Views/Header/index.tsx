import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Theme,
} from "@material-ui/core";
import { useGlobalStore } from "Store";
import SearchDialog from "./SearchDialog";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  title: {
    marginLeft: 16,
    fontSize: 18,
    // fontWeight: 'bold',
    color: "#ccc",
  },
  controlItems: {
    display: "flex",
    marginRight: 10,
  },
  controlItem: {
    marginRight: 16,
    fontSize: 14,
    color: "#ccc",
    cursor: "pointer",
    "&:hover": {
      color: "#06F3AF",
    },
  },
}));

const Header = () => {
  const classes = useStyles();
  const [searchOpen, setSearchOpen] = useState(false);
  const handleSearchOpen = () => {
    setSearchOpen(true);
  };
  const handleSearchClose = () => {
    setSearchOpen(false);
  };
  const store = useGlobalStore();
  useEffect(() => {
    store.set_vectors_count();
  }, []);
  return (
    <div className={classes.root}>
      <div className={classes.title}>Visualiztion for ANNS</div>
      <div className={classes.controlItems}>
        <div className={classes.controlItem} onClick={handleSearchOpen}>
          Search
        </div>
        <div className={classes.controlItem}>Index</div>
        <div className={classes.controlItem}>Setting</div>
        <div className={classes.controlItem}>About</div>
      </div>
      <SearchDialog open={searchOpen} handleClose={handleSearchClose} />
    </div>
  );
};

export default Header;
