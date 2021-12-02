import { IIndexParams } from "Types";

const params = {
  build: [
    {
      label: "efConstruction",
      value: "ef_construction",
      type: "select",
      optionValues: [8, 16, 32, 64, 128],
    },
    {
      label: "M",
      value: "M",
      type: "select",
      optionValues: [4, 8, 16, 32, 64, 128, 256],
    },
  ],
  search: [
    {
      label: "Top K",
      value: "k",
      type: "select",
      optionValues: [4, 8, 16, 32],
    },
    {
      label: "efSearch",
      value: "ef",
      type: "select",
      optionValues: [8, 16, 32, 64, 128],
    },
    {
      label: "Threads",
      value: "num_threads",
      type: "select",
      optionValues: [1, 2, 4, 8, 16],
    },
  ],
  vis: [],
} as IIndexParams;

export default params;
