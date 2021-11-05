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

const createStore = () => {
  return {
    indexTypeList: indexTypes,
    indexType: "hnsw",
    setIndexType(typeIndex: string) {
      this.indexType = typeIndex;
      set_index_type(typeIndex);
    },

    targetId: 0,
    setTargetId(id: number) {
      this.targetId = id;
      this.searchById();
    },

    async setData(file: File) {
      set_data(file);
    },
    async setBuildParams(params: { [key: string]: string | number }) {
      set_index_build_params(params);
    },
    async setSearchParams(params: { [key: string]: string | number }) {
      set_index_search_params(params);
    },
    async setVisParams(params: { [key: string]: string | number }) {
      set_index_vis_params(params);
    },

    VisData: [] as ILevel[],
    searchStatus: "ok",
    async searchById() {
      const id = this.targetId;
      console.log("searchById begin", id);
      const res = await search_by_id(id);
      console.log("get search res", res);
      if (res.msg === "ok") {
        runInAction(() => {
          this.VisData = res.data;
          this.searchStatus = res.msg;
        });
      } else {
        this.searchStatus = res.msg;
      }
    },
  } as IStore;
};

export default createStore;
