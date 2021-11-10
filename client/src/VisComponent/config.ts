import hnsw_force_config from "./HNSW_Force/config";
import ivf_flat_project_config from "./IVFFlat_Project/config";
import { IIndexParams } from "Types";

const config = {
  force: hnsw_force_config,
  project: ivf_flat_project_config,
} as { [key: string]: IIndexParams };

export default config;
