from base_index import BaseIndex
import hnswlib
import numpy as np
from collections import defaultdict

from custom_types import NodeType, LinkType


class HNSWIndex(BaseIndex):
    def __init__(self):
        self.ef_construction = 80
        self.M = 16

        self.ef = 16
        self.num_threads = 4

        self.k = 8

    def build(self):
        if not self.has_vectors:
            raise RuntimeError('Index Build Error: No Vectors')

        self.has_index = True
        self.index = hnswlib.Index('l2', self.dim)
        self.index.init_index(
            max_elements=len(self.vectors),
            ef_construction=self.ef_construction,
            M=self.M
        )
        self.index.add_items(self.vectors)

        self.index.set_ef(self.ef)
        self.index.set_num_threads(self.num_threads)

    def set_build_params(self, ef_construction, M):
        self.ef_construction = ef_construction
        self.M = M

        if self.has_vectors:
            self.build()

    def set_search_params(self, ef=16, k=8, num_threads=4):
        self.ef = ef
        self.num_threads = num_threads
        self.k = k

        if self.has_index:
            self.index.set_ef(self.ef)
            self.index.set_num_threads(self.num_threads)

    def get_search_vis_data(self, p):
        if not self.has_index:
            return None

        labels, distances, visited_records = self.index.knn_query_for_vis([
                                                                          p], k=self.k)

        vis_data = []

        fine_ids = labels[0]
        visited_record = visited_records[0]
        num_level = len(visited_record)
        entry_id = -1

        for level in range(num_level-1, -1, -1):
            # the entry of level-k+1 === the fine of level-k
            if level < num_level - 1:
                fine_ids = [entry_id]

            visited_record_level = visited_record[level]

            node_type = defaultdict(lambda: NodeType.Coarse)
            link_type = defaultdict(lambda: LinkType.Visited)
            node_dist = defaultdict(lambda: -1)

            source_map = defaultdict(lambda: -1)

            for source, target, dist in visited_record_level:
                # entry
                if source < 0:
                    entry_id = target
                    node_dist[target] = dist

                else:
                    node_type[source] = max(
                        node_type[source], NodeType.Candidate)
                    node_type[target] = max(node_type[target], NodeType.Coarse)

                    # visited or not
                    if target in node_dist:
                        link_type[(source, target)] = max(
                            link_type[(source, target)], LinkType.Visited)
                    else:
                        node_dist[target] = dist
                        link_type[(source, target)] = max(
                            link_type[(source, target)], LinkType.Extended)

                        source_map[target] = source

                        # for the non-base-layer，"search" means "fine"
                        # 不需要判断search，后面直接判定fine就行
                        if level == num_level - 1:
                            pre_source = source_map[source]
                            if pre_source >= 0:
                                link_type[(pre_source, source)] = max(
                                    link_type[(pre_source, source)],
                                    LinkType.Searched)

            for fine_id in fine_ids:
                node_type[fine_id] = max(node_type[source], NodeType.Fine)

                t = fine_id
                s = source_map[t]
                while s >= 0:
                    link_type[(s, t)] = max(link_type[(s, t)], LinkType.Fine)
                    t = s
                    s = source_map[t]

            vis_data_level = {
                'entry_ids': [entry_id],
                'fine_ids': list(fine_ids),
                'nodes': [{
                    'id': id,
                    'type': type,
                    'dist': node_dist[id]
                } for id, type in node_type.items()],
                'links': [{
                    'source': link[0],
                    'target': link[1],
                    'type': type,
                } for link, type in link_type.items()]
            }

            vis_data.append(vis_data_level)

        return vis_data
