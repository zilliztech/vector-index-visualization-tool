// import * as d3 from "d3";
import {
  set_data,
  set_index_type,
  set_index_build_params,
  set_index_search_params,
  set_index_vis_params,
  search_by_id,
  get_vectors_count,
} from "Server";
import { runInAction } from "mobx";
import { ILevel, IStore, TParams } from "Types";

const indexTypes = ["ivf_flat", "hnsw"];

const visTypeOptions = {
  hnsw: ["force-one", "force", "force-dist"],
  ivf_flat: ["voronoi-area", "project", "voronoi"],
} as { [key: string]: string[] };

const defaultIndexType = "ivf_flat";
const defaultVisType = visTypeOptions[defaultIndexType][0];

const createStore = () => {
  return {
    indexTypeList: indexTypes,
    indexType: defaultIndexType,
    async setIndexType(indexType: string) {
      console.log("setIndexType", indexType);
      this.indexType = indexType;
      this.visType = visTypeOptions[indexType][0];

      this.searchStatus = "pending";
      await set_index_type(indexType);
      // this.searchById();
    },
    initIndexType() {
      console.log("initIndexType");
      this.setIndexType(defaultIndexType);
    },
    visType: defaultVisType,
    get visTypeList() {
      return visTypeOptions[this.indexType];
    },
    setVisType(visType: string) {
      this.visType = visType;
      // this.searchStatus = "pending";
    },

    targetId: 0,
    setTargetId(id: number) {
      this.targetId = id;
      this.searchById();
    },

    async setData(file: File) {
      set_data(file);
    },
    buildParams: {},
    async setBuildParams(params: TParams) {
      this.buildParams = Object.assign({}, this.buildParams, params);
      set_index_build_params(params);
    },
    searchParams: {},
    async setSearchParams(params: TParams) {
      this.searchParams = Object.assign({}, this.searchParams, params);
      set_index_search_params(params);
    },
    async initParams(buildParams: TParams, searchParams: TParams) {
      await set_index_build_params(buildParams);
      await set_index_search_params(searchParams);
      this.searchById();
    },

    visParams: {
      project_method: "",
      project_params: "",
    },
    async setVisParams(params: TParams) {
      for (let key in params) {
        this.visParams[key] = params[key];
      }
      set_index_vis_params(this.visParams);
    },

    visData: [] as ILevel[],
    searchStatus: "not",
    async searchById() {
      this.searchStatus = "pending";
      const id = this.targetId;
      console.log("searchById begin", id);
      const res = await search_by_id(id);
      console.log("get search res", res);
      if (res.msg === "ok") {
        runInAction(() => {
          this.visData = res.data;
          this.searchStatus = res.msg;
        });
      } else {
        this.searchStatus = res.msg;
      }
    },

    vectors_count: 0,
    async set_vectors_count() {
      const { count = 0 } = await get_vectors_count();
      this.vectors_count = count;
    },
  } as IStore;
};

export default createStore;
