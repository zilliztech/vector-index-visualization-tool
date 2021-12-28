import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import ListItemButton from "@mui/material/ListItemButton";
import StarIcon from "@mui/icons-material/Star";

const IndexTypeDialog = observer(
  ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
    const store = useGlobalStore();
    const {
      indexTypeList,
      indexType,
      setIndexType,
      // searchById
    } = store;
    // const handleClickClose = () => searchById();

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle>Select Index Type</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>Select an index method</DialogContentText> */}
          <List>
            {indexTypeList.map((type) => (
              <ListItem>
                <ListItemButton onClick={() => setIndexType(type)}>
                  {type === indexType ? (
                    <>
                      <ListItemIcon>
                        <StarIcon />
                      </ListItemIcon>
                      <ListItemText primary={type} />
                    </>
                  ) : (
                    <ListItemText inset primary={type} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={handleClickClose}>OK</Button>
        </DialogActions> */}
      </Dialog>
    );
  }
);

export default IndexTypeDialog;
