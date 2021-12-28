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

const IndexParamsDialog = observer(
  ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
    const store = useGlobalStore();
    const { indexTypeList, indexType, setIndexType } = store;

    return <Dialog open={open} onClose={handleClose}></Dialog>;
  }
);

export default IndexParamsDialog;
