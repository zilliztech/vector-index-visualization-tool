import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 8,
    marginRight: 8,
    // borderBottom: "1px solid #ddd",
  },
  header: {
    fontSize: 18,
    fontWeight: 600,
    color: "#333",
    marginBottom: 8,
  },
});

const ControlPanel = (props: any) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.header}>{props.header}</div>
      {props.children}
    </div>
  );
};

export default ControlPanel;
