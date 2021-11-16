import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import ControlPanel from "Components/ControlPanel";
import Upload from "Components/Upload";
import CustomSelect from "Components/CustomSelect";
import paramsConfig from "VisComponent/config";

const ControlView = observer(() => {
  const store = useGlobalStore();
  const {
    indexType,
    setIndexType,
    indexTypeList,
    visType,
    visTypeList,
    setVisType,
    buildParams,
    searchParams,
    visParams,
    setBuildParams,
    setSearchParams,
    setVisParams,
    targetId,
    setTargetId,
  } = store;
  const config = paramsConfig[visType];

  const handleSetBuildParams = (label: string, value: string | number) => {
    setBuildParams({ [label]: value });
  };
  const handleSetSearchParams = (label: string, value: string | number) => {
    setSearchParams({ [label]: value });
  };
  const handleSetVisParams = (label: string, value: string | number) => {
    setVisParams({ [label]: value });
  };

  return (
    <div>
      <ControlPanel header="Data">
        <Upload />
      </ControlPanel>
      <ControlPanel header="Target">
        <CustomSelect
          label=""
          value={targetId}
          setValue={setTargetId}
          options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
        />
      </ControlPanel>
      <ControlPanel header="Index Type">
        <CustomSelect
          label=""
          value={indexType}
          setValue={setIndexType}
          options={indexTypeList}
        />
      </ControlPanel>
      <ControlPanel header="Vis Type">
        <CustomSelect
          label=""
          value={visType}
          setValue={setVisType}
          options={visTypeList}
        />
      </ControlPanel>
      <ControlPanel header="Build">
        {config.build.map((param) =>
          param.type === "select" ? (
            <CustomSelect
              label={param.label}
              value={buildParams[param.value] || param.optionValues[0]}
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
              value={searchParams[param.value] || param.optionValues[0]}
              setValue={(value) => handleSetSearchParams(param.value, value)}
              options={param.optionValues}
              labels={param.optionLabels}
            />
          ) : (
            <></>
          )
        )}
      </ControlPanel>
      {config.vis.length > 0 && <ControlPanel header="Visualize">
        {config.vis.map((param) =>
          param.type === "select" ? (
            <CustomSelect
              label={param.label}
              value={visParams[param.value] || param.optionValues[0]}
              setValue={(value) => handleSetVisParams(param.value, value)}
              options={param.optionValues}
              labels={param.optionLabels}
            />
          ) : (
            <></>
          )
        )}
      </ControlPanel>}
    </div>
  );
});

export default ControlView;
