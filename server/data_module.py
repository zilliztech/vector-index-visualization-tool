class Data:
    def __init__(self):
        self.vectors = []
        self.keys = []
        self.has_data = False

    def set_data(self, data, key_attr='name', vector_attr='vector'):
        if len(data) == 0:
            raise RuntimeError('Data Error: Data is empty')

        self.has_data = True

        self.keys = [d[key_attr] for d in data]
        self.vectors = [d[vector_attr] for d in data]

    def key2id(self, key):
        if key not in self.keys:
            return -1
        return self.keys.index(key)

    def id2key(self, id):
        if id not in range(len(self.keys)):
            return -1
        else:
            return self.keys[id]
