import React from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useGlobalStore } from "Store";

const useStyles = makeStyles({
  input: {
    display: "none",
  },
});

const Upload = () => {
  const classes = useStyles();
  const store = useGlobalStore();
  const { setData } = store as any;
  const uploadFile = (e: any) => {
    const file = e.target.files[0];
    setData(file);
  };
  return (
    <>
      <input
        accept=".csv"
        className={classes.input}
        id="upload-csv"
        // multiple
        type="file"
        onChange={uploadFile}
      />
      <label htmlFor="upload-csv">
        <Button
          variant="contained"
          color="primary"
          size="small"
          component="span"
        >
          Upload
        </Button>
      </label>
    </>
  );
};

export default Upload;
