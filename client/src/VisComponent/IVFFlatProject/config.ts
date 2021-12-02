import { IIndexParams } from "Types";

const params = {
  build: [
    {
      label: "Nlist",
      value: "nlist",
      type: "select",
      optionValues: [8, 16, 32, 64, 128],
    },
  ],
  search: [
    {
      label: "Top K",
      value: "k",
      type: "select",
      optionValues: [8, 16, 32],
    },
    {
      label: "Nprobe",
      value: "nprobe",
      type: "select",
      optionValues: [4, 8, 16, 32, 64, 128],
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