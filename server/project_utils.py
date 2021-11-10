import numpy as np
import umap.umap_ as umap

default_umap_params = {
    'n_neighbors': 15,
    'min_dist': 0.1,
    # 'n_components': 2,
    # 'metric': 'euclidean'
}


class Projection:
    def __init__(self):
        self.method = 'umap'
        self.umap_params = default_umap_params
        self.fit = umap.UMAP(**self.umap_params).fit_transform

    def get_projections(self, matrix):
        if self.method == 'umap':
            return self.fit(matrix)
        else:
            raise RuntimeError('Projection Error: Not supported method')

    def set_method(self, method, params={}):
        if self.method == 'umap':
            self.method = method
            self.umap_params = {
                key: params[key]
                if key in params else default_umap_params[key]
                for key in default_umap_params
            }
            self.fit = umap.UMAP(**self.umap_params).fit_transform
        else:
            pass
            # raise RuntimeError('Projection Error: Not supported method')


projection = Projection()
