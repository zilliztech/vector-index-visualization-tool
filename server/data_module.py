import json
import numpy as np
class Data:
    def __init__(self):
        self.vectors = []
        self.keys = []
        self.has_data = False
        self.test_number = 10

    def set_data(self, data, key_attr='name', vector_attr='vector'):
        if len(data) == 0:
            raise RuntimeError('Data Error: Data is empty')

        self.has_data = True

        self.keys = [d[key_attr] for d in data]
        self.vectors = [np.array(json.loads(d[vector_attr]), dtype='float32') for d in data]

        self.train_keys = self.keys[:-self.test_number]
        self.train_vectors = self.vectors[:-self.test_number]

        self.test_keys = self.keys[-self.test_number:]
        self.test_vectors = self.vectors[-self.test_number:]

    def key2id(self, key):
        if key not in self.keys:
            return -1
        return self.keys.index(key)

    def id2key(self, id):
        if id not in range(len(self.keys)):
            return -1
        else:
            return self.keys[id]

    def test_id2key(self, _id):
        id = _id + len(self.train_keys)
        if id not in range(len(self.keys)):
            return -1
        else:
            return self.keys[id]

    def id2key(self, id):
        if id not in range(len(self.keys)):
            return -1
        else:
            return self.keys[id]
