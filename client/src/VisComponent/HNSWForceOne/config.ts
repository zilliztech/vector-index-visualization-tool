import { IIndexParams } from "Types";

const params = {
  build: [
    {
      label: "EfConstruction",
      value: "ef_construction",
      type: "select",
      optionValues: [8, 16, 32, 64, 128],
      defaultValue: 16,
    },
    {
      label: "M",
      value: "M",
      type: "select",
      optionValues: [4, 8, 16, 32, 64],
      defaultValue: 8,
    },
  ],
  search: [
    {
      label: "Top K",
      value: "k",
      type: "select",
      optionValues: [4, 8, 16, 32],
      defaultValue: 4,
    },
    {
      label: "EfSearch",
      value: "ef",
      type: "select",
      optionValues: [8, 16, 32, 64, 128],
      defaultValue: 16,
    },
    // {
    //   label: "Threads",
    //   value: "num_threads",
    //   type: "select",
    //   optionValues: [1, 2, 4, 8, 16],
    // },
  ],
  vis: [],
} as IIndexParams;

export default params;
