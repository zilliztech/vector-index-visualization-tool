from base_index import BaseIndex
import numpy as np
from collections import defaultdict
import faiss

from project_utils import projection

from custom_types import NodeType, LinkType

fine_search_include_centroids = False


class FaissIvfIndex(BaseIndex):
    def __init__(self):
        self.nlist = 32

        self.nprobe = 4

        self.k = 8

    def build(self):
        if not self.has_vectors:
            raise RuntimeError('Index Build Error: No Vectors')

        self.has_index = True
        self.index = faiss.index_factory(self.dim, 'IVF%s,Flat' % self.nlist)
        self.index.train(self.vectors)
        self.index.add(self.vectors)

        self.index.nprobe = self.nprobe

        self.init_centroids()

    def init_centroids(self):
        index = self.index
        self.centroids = index.quantizer.reconstruct_n(0, index.nlist)

        invlists = index.invlists
        list_id2vector_ids = [
            faiss.rev_swig_ptr(
                invlists.get_ids(list_id),
                invlists.list_size(list_id)
            ).tolist()
            for list_id in range(index.nlist)
        ]
        self.list_id2vector_ids = list_id2vector_ids

        vector_id2list_id = {}
        max_nlist_size = 0
        for list_id in range(index.nlist):
            max_nlist_size = max(
                max_nlist_size,
                len(list_id2vector_ids[list_id])
            )
            for vector_id in list_id2vector_ids[list_id]:
                vector_id2list_id[vector_id] = list_id
        self.vector_id2list_id = vector_id2list_id
        self.max_nlist_size = max_nlist_size

    def set_build_params(self, nlist):
        self.nlist = nlist

        if self.has_vectors:
            self.build()

    def set_search_params(self, nprobe, k=8):
        self.nprobe = nprobe
        self.k = k

        if self.has_index:
            self.index.nprobe(self.nprobe)

    def get_search_vis_data(self, p):
        if not self.has_index:
            return None
            
        index = self.index

        target = np.array([p], dtype='float32')
        _, _fine_ids = index.search(target, self.k)
        fine_ids = _fine_ids[0]

        nprobe_k = min(self.max_nlist_size * index.nprobe, index.ntotal)
        _, _nprobe_k_ids = index.search(target, nprobe_k)
        nprobe_k_ids = _nprobe_k_ids[0]
        nprobe_list_ids = list({
            self.vector_id2list_id[id]
            for id in nprobe_k_ids if id >= 0
        })

        self.centroids_projections = projection.get_projections(
            self.centroids
        )

        p_centroid_projection = self.centroids_projections[nprobe_list_ids].mean(
            0).tolist()

        vis_data_nlist = {
            'entry_ids': [],
            'fine_ids': nprobe_k_ids.tolist(),
            'links': [],
            'nodes': [
                {
                    'id': 'centroid-%s' % i,
                    'projection': self.centroid_projection[i].tolist(),
                    'type': NodeType.Fine if i in nprobe_list_ids else NodeType.Coarse
                }
                for i in range(index.nlist)
            ] + [
                {
                    'id': 'target',
                    'projection': p_centroid_projection,
                    'type': NodeType.Target
                }
            ],
        }

        coarse_ids = []
        for list_id in nprobe_list_ids:
            coarse_ids += self.list_id2vector_ids[list_id]
        coarse_vectors = [self.vectors[id] for id in coarse_ids]

        # including centroid or not
        fit_vectors = coarse_vectors
        coarse_centroids = []

        if fine_search_include_centroids:
            coarse_centroids = [self.centroids[list_id]
                                for list_id in nprobe_list_ids]
            fit_vectors = coarse_vectors + coarse_centroids

        node_projections = projection.get_projections(fit_vectors)

        nodes = [
            {
                'id': coarse_ids[i],
                'projection': node_projections[i],
                'type': NodeType.Fine if coarse_ids[i] in fine_ids else NodeType.Coarse,
                'cluster_id': self.vector_id2list_id[coarse_ids[i]]
            }
            for i in range(len(coarse_vectors))
        ]

        if fine_search_include_centroids:
            nodes += [
                {
                    'id': 'centroid-%d' % nprobe_list_ids[i],
                    'projection': node_projections[len(coarse_ids) + i],
                    'type': NodeType.Coarse,
                    'cluster_id': nprobe_list_ids[i],
                }
                for i in range(len(coarse_centroids))
            ]

        vis_data_nprobe = {
            'entry_ids': nprobe_list_ids,
            'fine_ids': list(fine_ids),
            'nodes': nodes,
            'links': []
        }

        return [vis_data_nlist, vis_data_nprobe]
