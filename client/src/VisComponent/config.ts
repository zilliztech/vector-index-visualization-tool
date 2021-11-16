import hnsw_force_config from "./HNSW_Force/config";
import hnsw_force_dist_config from "./HNSW_ForceDist/config";
import ivf_flat_project_config from "./IVFFlat_Project/config";
import ivf_flat_voronoi_config from "./IVFFlat_Voronoi/config";
import { IIndexParams } from "Types";

const config = {
  force: hnsw_force_config,
  "force-dist": hnsw_force_dist_config,
  project: ivf_flat_project_config,
  voronoi: ivf_flat_voronoi_config,
} as { [key: string]: IIndexParams };

export default config;
