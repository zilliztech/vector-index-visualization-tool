import { IIndexParams } from "Types";

const params = {
  build: [
    {
      label: "Nlist",
      value: "nlist",
      type: "select",
      optionValues: [64, 96, 128, 160, 200, 256, 320],
      defaultValue: 256,
    },
  ],
  search: [
    {
      label: "Top K",
      value: "k",
      type: "select",
      optionValues: [4, 8, 12, 16, 20, 24, 32],
      defaultValue: 8,
    },
    {
      label: "Nprobe",
      value: "nprobe",
      type: "select",
      optionValues: [4, 6, 8, 10, 12, 15, 20],
      defaultValue: 8,
    },
  ],
  vis: [
    {
      label: "Project Method",
      value: "project_method",
      type: "select",
      optionLabels: ["UMAP", "t-SNE", "MDS", "PCA"],
      optionValues: ["umap", "t-sne", "mds", "pca"],
    },
  ],
} as IIndexParams;

export default params;
