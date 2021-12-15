from hnswlib_hnsw import HNSWIndex
from faiss_ivf import FaissIvfIndex
from data_module import Data


class Index:
    def __init__(self):
        self.ivf_flat = FaissIvfIndex()
        self.hnsw = HNSWIndex()
        self.data = Data()

        self.index_type = 'hnsw'
        self.index = self.hnsw

    def set_index_type(self, index_type):
        if index_type == 'hnsw':
            self.index_type = 'hnsw'
            self.index = self.hnsw
        elif index_type == 'ivf_flat':
            self.index_type = 'ivf_flat'
            self.index = self.ivf_flat
        else:
            raise RuntimeError('Index Name Error')

        if self.data.has_data:
            self.index.set_vectors(self.data.vectors)

    def set_data(self, data, key_attr='name', vector_attr='vector'):
        self.data.set_data(data, key_attr, vector_attr)
        self.index.set_vectors(self.data.train_vectors)

    def set_search_params(self, params):
        self.index.set_search_params(params)

    def set_build_params(self, params):
        self.index.set_build_params(params)

    def get_search_vis_data(self, p):
        vis_res = self.index.get_search_vis_data(p)
        self.data.map_key(vis_res)
        return vis_res

    def search_by_id(self, id):
        # if not self.data.has_data:
        #     return None
        vis_res = self.index.get_search_vis_data(self.data.test_vectors[id])
        # self.data.map_keys(vis_res)
        return vis_res
    
    def get_corase_vis_data(self, id):
        if self.index_type == 'ivf_flat':
            return self.index.get_corase_vis_data()

        else:
            return []
