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

    def set_data(self, data):
        self.data.set_data(data)
        self.index.set_vectors(self.data.vectors)

    def set_search_params(self, **params):
        self.index.set_search_params(**params)
    
    def set_build_params(self, **params):
        self.index.set_build_params(**params)

    def get_search_vis_data(self, p):
        return self.index.get_search_vis_data(p)
