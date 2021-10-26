class BaseIndex:
    def __init__(self):
        self.index = None
        self.has_index = False

        self.vectors = []
        self.keys = []
        self.dim = 0
        self.has_data = False
        pass

    def set_data(self, data, key_attr='name', vector_attr='vector'):
        if len(data) == 0:
            raise RuntimeError('Data Error: Data is empty')

        self.has_data = True
        self.keys = [d[key_attr] for d in data]
        self.vectors = [d[vector_attr] for d in data]
        self.dim = len(data[0][vector_attr])

        self.build()
