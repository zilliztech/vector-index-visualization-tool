import React from "react";
import { makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    marginLeft: 16,
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#ccc'
  }, 
  controlItems: {
    display: 'flex',
    marginRight: 10,
  },
  controlItem: {
    marginRight: 16,
    fontSize: 14,
    color: '#ccc',
    cursor: 'pointer',
    '&:hover': {
      color: "#06F3AF",
    },
  },
}))

const Header = () => {
  const classes = useStyles();
  return <div className={classes.root} >
    <div className={classes.title}>
      Visualiztion for ANNS
    </div>
    <div className={classes.controlItems}>
      <div className={classes.controlItem}>Search</div>
      <div className={classes.controlItem}>Index</div>
      <div className={classes.controlItem}>Setting</div>
      <div className={classes.controlItem}>About</div>
    </div>
  </div>;
};

export default Header;
