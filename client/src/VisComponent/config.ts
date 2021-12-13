import hnsw_force_config from "./HNSWForce/config";
import hnsw_force_dist_config from "./HNSWForceDist/config";
import ivf_flat_project_config from "./IVFFlatProject/config";
import ivf_flat_voronoi_config from "./IVFFlatVoronoi/config";
import ivf_flat_voronoi_area_config from "./IVFFlatVoronoiArea/config";
import hnsw_force_one_config from "./HNSWForceOne/config"
import { IIndexParams } from "Types";

const config = {
  force: hnsw_force_config,
  "force-dist": hnsw_force_dist_config,
  "force-one": hnsw_force_one_config,
  project: ivf_flat_project_config,
  voronoi: ivf_flat_voronoi_config,
  "voronoi-area": ivf_flat_voronoi_area_config,
} as { [key: string]: IIndexParams };

export default config;
