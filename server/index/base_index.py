class BaseIndex:
    def __init__(self):
        self.index = None
        self.has_index = False
        self.has_vectors = False

        self.vectors = []
        self.dim = 0

    def set_data(self, vectors):
        self.vectors = vectors
        self.dim = len(vectors[0])
        self.build()