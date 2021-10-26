import numpy as np
import umap.umap_ as umap

class Projection:
    def __init__(self):
        self.method = 'umap'
        self.umap_fit = umap.UMAP(
            n_neighbors=10,
        )

    def set_method(self, method):
        self.method = method
    
    def get_projections(self, matrix):
        if self.method == 'umap':
            return self.umap_fit.fit_transform(matrix)
        else:
            raise RuntimeError('Projection Error: Not supported method')

projection = Projection()