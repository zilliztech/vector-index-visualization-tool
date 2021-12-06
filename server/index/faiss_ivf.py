from base_index import BaseIndex
import numpy as np
from collections import defaultdict
import faiss

from project_utils import projection

from custom_types import NodeType, LinkType


class FaissIvfIndex(BaseIndex):
    def __init__(self):
        self.nlist = 32

        self.nprobe = 4

        self.k = 8

        self.fine_search_include_centroids = False

    def build(self):
        if not self.has_vectors:
            raise RuntimeError('Index Build Error: No Vectors')

        self.has_index = True
        self.index = faiss.index_factory(self.dim, 'IVF%s,Flat' % self.nlist)

        train_vectors = np.array(self.vectors, dtype='float32')
        self.index.train(train_vectors)
        self.index.add(train_vectors)

        self.init_centroids()

        self.index.nprobe = self.nprobe

        

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

        list_id2nearest_node = {}
        index.nprobe = 1
        for list_id in range(index.nlist):
            _, _fine_ids = index.search(self.centroids[list_id: list_id+1], 1)
            list_id2nearest_node[list_id] = int(_fine_ids[0][0])
        self.list_id2nearest_node = list_id2nearest_node

    def set_build_params(self, params):
        self.nlist = params.get('nlist', self.nlist)

        if self.has_vectors:
            self.build()

    def set_search_params(self, params):
        self.nprobe = params.get('nprobe', self.nprobe)
        self.k = params.get('k', self.k)

        if self.has_index:
            self.index.nprobe = self.nprobe

    def get_search_vis_data(self, p):
        if not self.has_index:
            return None

        index = self.index

        target = np.array([p], dtype='float32')
        _, _fine_ids = index.search(target, self.k)
        fine_ids = [int(id) for id in _fine_ids[0]]

        nprobe_k = min(self.max_nlist_size * index.nprobe, index.ntotal)
        _, _nprobe_k_ids = index.search(target, nprobe_k)
        nprobe_k_ids = [int(id) for id in _nprobe_k_ids[0]]
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
            'fine_ids': ['centroid-%s' % id for id in nprobe_list_ids],
            'links': [],
            'nodes': [
                {
                    'id': 'centroid-%s' % i,
                    'projection': self.centroids_projections[i].tolist(),
                    'type': NodeType.Fine if i in nprobe_list_ids else NodeType.Coarse,
                    'cluster_id': i,
                    'count': len(self.list_id2vector_ids[i]),
                    'nearest_node': self.list_id2nearest_node[i]
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

        if self.fine_search_include_centroids:
            coarse_centroids = [self.centroids[list_id]
                                for list_id in nprobe_list_ids]
            fit_vectors = coarse_vectors + coarse_centroids

        fit_vectors += [p]

        node_projections = projection.get_projections(fit_vectors).tolist()

        nodes = [
            {
                'id': coarse_ids[i],
                'projection': node_projections[i],
                'type': NodeType.Fine if coarse_ids[i] in fine_ids else NodeType.Coarse,
                'cluster_id': self.vector_id2list_id[coarse_ids[i]]
            }
            for i in range(len(coarse_ids))
        ]

        if self.fine_search_include_centroids:
            nodes += [
                {
                    'id': 'centroid-%d' % nprobe_list_ids[i],
                    'projection': node_projections[len(coarse_ids) + i],
                    'type': NodeType.Coarse,
                    'cluster_id': nprobe_list_ids[i],
                }
                for i in range(len(coarse_centroids))
            ]

        nodes += [
            {
                'id': 'target',
                'projection': node_projections[-1],
                'type': NodeType.Target,
                'cluster_id': -1
            }
        ]

        vis_data_nprobe = {
            'entry_ids': ['centroid-%s' % id for id in nprobe_list_ids],
            'fine_ids': list(fine_ids),
            'nodes': nodes,
            'links': []
        }

        return [vis_data_nlist, vis_data_nprobe]

    def get_corase_vis_data(self):
        if not self.has_index:
            return None

        index = self.index

        self.centroids_projections = projection.get_projections(
            self.centroids
        )

        # todo: nearest id / random id
        coarse_vis_data = [
            {
                'id': 'centroid-%s' % i,
                'count': len(self.list_id2vector_ids[i]),
                'projection': self.centroids_projections[i].tolist(),

            }
            for i in range(index.nlist)
        ]

        return coarse_vis_data