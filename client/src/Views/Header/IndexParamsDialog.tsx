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

const AboutDialog = observer(
  ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
    const store = useGlobalStore();
    const { indexTypeList, indexType, setIndexType } = store;

    return <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Index Params Setting</DialogTitle>
      <DialogContent>
        <DialogContentText>Select an index method</DialogContentText>
      </DialogContent>
    </Dialog>;
  }
);

export default AboutDialog;
