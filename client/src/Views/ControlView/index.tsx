import React from "react";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import ControlPanel from "Components/ControlPanel";
import Upload from "Components/Upload";
import CustomSelect from "Components/CustomSelect";

const ControlView = observer(() => {
  const store = useGlobalStore();
  const {indexType, setIndexType, indexTypeList} = store;
  return <div>
    <ControlPanel header="Data">
      <Upload />
    </ControlPanel>
    <ControlPanel header="Index Type">
      <CustomSelect
        label=""
        value={indexType}
        setValue={setIndexType}
        options={indexTypeList}
      />
    </ControlPanel>
  </div>;
});

export default ControlView;
