import React, { useState } from "react";
import {
  makeStyles,
  Theme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";

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

const SearchDialog = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const handleClickClose = () => {
    console.log("handleClickClose");
    handleClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Search</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select an image as the search target.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};
