import React, { useEffect, useState } from "react";
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
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { generateRandomSamples } from "Utils";
import { get_image_url } from "Server";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    paddingLeft: 10,
    paddingRight: 10,
  },
  imgItem: {
    width: "29%",
    height: "15vh",
    marginTop: 16,
    marginBottom: 16,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    cursor: "pointer",
    border: "6px solid #ccc",
    opacity: 0.85,
    borderRadius: 5,
    "&:hover": {
      boxShadow: "0 0 30px #666",
      opacity: 1,
    },
  },
  imgActive: {
    borderColor: "#06F3AF",
    opacity: 1,
  },
}));

const SearchDialog = observer(
  ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
    const classes = useStyles();
    const store = useGlobalStore();
    const { vectors_count, setTargetId } = store;

    const optionCount = 6;
    const [options, setOptions] = useState<number[]>([]);
    const [selectedId, setSelectedId] = useState(options[0]);
    const refreshNewOptions = () => {
      const options = generateRandomSamples(vectors_count, optionCount);
      setOptions(options);
      setSelectedId(options[0]);
    };

    const handleClickClose = () => {
      console.log("handleClickClose");
      handleClose();
      setTargetId(selectedId);
    };

    useEffect(() => {
      refreshNewOptions();
    }, [vectors_count]);
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Search</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select an image as the search target.
          </DialogContentText>
          <div className={classes.root}>
            {options.map((option, i) => (
              <div
                key={`image-${i}`}
                className={classes.imgItem}
                onClick={() => setSelectedId(option)}
              >
                <img
                  className={
                    classes.img +
                    " " +
                    (option === selectedId ? classes.imgActive : "")
                  }
                  src={get_image_url(option)}
                />
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={refreshNewOptions}>Referesh</Button>
          <Button onClick={handleClickClose}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default SearchDialog;
