// import * as d3 from "d3";
import {
  set_data,
  set_index_type,
  set_index_build_params,
  set_index_search_params,
  set_index_vis_params,
  search_by_id,
} from "Server";
import { runInAction } from "mobx";
import { ILevel, IStore } from "Types";

const indexTypes = ["ivf_flat", "hnsw"];

const visTypeOptions = {
  hnsw: ["force", "force-dist", "force-one"],
  ivf_flat: ["project", "voronoi", "voronoi-area"],
} as { [key: string]: string[] };

const defaultIndexType = "hnsw";
const defaultVisType = visTypeOptions[defaultIndexType][0];

const createStore = () => {
  return {
    indexTypeList: indexTypes,
    indexType: defaultIndexType,
    setIndexType(indexType: string) {
      this.indexType = indexType;
      this.visType = visTypeOptions[indexType][0];
      set_index_type(indexType);

      this.searchStatus = "pending";
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
    async setBuildParams(params: { [key: string]: string | number }) {
      this.buildParams = Object.assign({}, this.buildParams, params);
      set_index_build_params(params);
    },
    searchParams: {},
    async setSearchParams(params: { [key: string]: string | number }) {
      this.searchParams = Object.assign({}, this.searchParams, params);
      set_index_search_params(params);
    },

    visParams: {
      project_method: "",
      project_params: "",
    },
    async setVisParams(params: { [key: string]: string | number }) {
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
  } as IStore;
};

export default createStore;
