import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import paramsConfig from "VisComponent/config";
import CustomSelect from "Components/CustomSelect";
import ControlPanel from "Components/ControlPanel";

const AboutDialog = observer(
  ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
    const store = useGlobalStore();
    const {
      visType,
      buildParams,
      setBuildParams,
      searchParams,
      setSearchParams,
      searchById,
      initParams,
    } = store;
    const config = paramsConfig[visType];

    const handleSetBuildParams = (label: string, value: string | number) => {
      setBuildParams({ [label]: value });
    };
    const handleSetSearchParams = (label: string, value: string | number) => {
      setSearchParams({ [label]: value });
    };

    const handleClickClose = () => {
      handleClose();
      searchById();
    };

    const _initParams = () => {
      const _buildParams = {} as { [key: string]: string | number };
      config.build.forEach((param) => {
        _buildParams[param.value] =
          buildParams[param.value] ||
          param.defaultValue ||
          param.optionValues[0];
      });
      const _searchParams = {} as { [key: string]: any };
      config.search.forEach((param) => {
        _searchParams[param.value] =
          searchParams[param.value] ||
          param.defaultValue ||
          param.optionValues[0];
      });
      initParams(_buildParams, _searchParams);
    };

    useEffect(() => {
      _initParams();
    }, [visType]);

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle>Index Params Setting</DialogTitle>
        <DialogContent>
          <DialogContentText>Select an index method</DialogContentText>
          <ControlPanel header="Build">
            {config.build.map((param) =>
              param.type === "select" ? (
                <CustomSelect
                  label={param.label}
                  value={
                    buildParams[param.value] ||
                    param.defaultValue ||
                    param.optionValues[0]
                  }
                  setValue={(value) => handleSetBuildParams(param.value, value)}
                  options={param.optionValues}
                  labels={param.optionLabels}
                />
              ) : (
                <></>
              )
            )}
          </ControlPanel>
          <ControlPanel header="Search">
            {config.search.map((param) =>
              param.type === "select" ? (
                <CustomSelect
                  label={param.label}
                  value={
                    searchParams[param.value] ||
                    param.defaultValue ||
                    param.optionValues[0]
                  }
                  setValue={(value) =>
                    handleSetSearchParams(param.value, value)
                  }
                  options={param.optionValues}
                  labels={param.optionLabels}
                />
              ) : (
                <></>
              )
            )}
          </ControlPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default AboutDialog;
