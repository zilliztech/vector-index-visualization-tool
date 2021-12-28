import React, { useEffect, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core";
import { useGlobalStore } from "Store";
import SearchDialog from "./SearchDialog";
import IndexTypeDialog from "./IndexTypeDialog";
import IndexParamsDialog from "./IndexParamsDialog";
import AboutDialog from "./AboutDialog";

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

  const [indexTypeOpen, setIndexTypeOpen] = useState(false);
  const handleIndexTypeOpen = () => {
    setIndexTypeOpen(true);
  };
  const handleIndexTypeClose = () => {
    setIndexTypeOpen(false);
  };

  const [indexParamsOpen, setIndexParamsOpen] = useState(false);
  const handleIndexParamsOpen = () => {
    setIndexParamsOpen(true);
  };
  const handleIndexParamsClose = () => {
    setIndexParamsOpen(false);
  };

  const [aboutOpen, setAboutOpen] = useState(false);
  const handleAboutOpen = () => {
    setAboutOpen(true);
  };
  const handleAboutClose = () => {
    setAboutOpen(false);
  };

  const store = useGlobalStore();
  const { set_vectors_count, setIndexType, indexType } = store;
  useEffect(() => {
    set_vectors_count();
    setIndexType(indexType);
  }, []);
  return (
    <div className={classes.root}>
      <div className={classes.title}>Visualiztion for ANNS</div>
      <div className={classes.controlItems}>
        <div className={classes.controlItem} onClick={handleSearchOpen}>
          Search
        </div>
        <div className={classes.controlItem} onClick={handleIndexTypeOpen}>
          Index
        </div>
        <div className={classes.controlItem} onClick={handleIndexParamsOpen}>
          Setting
        </div>
        <div className={classes.controlItem} onClick={handleAboutOpen}>
          About
        </div>
      </div>
      <SearchDialog open={searchOpen} handleClose={handleSearchClose} />
      <IndexTypeDialog
        open={indexTypeOpen}
        handleClose={handleIndexTypeClose}
      />
      <IndexParamsDialog
        open={indexParamsOpen}
        handleClose={handleIndexParamsClose}
      />
      <AboutDialog open={aboutOpen} handleClose={handleAboutClose} />
    </div>
  );
};

export default Header;
