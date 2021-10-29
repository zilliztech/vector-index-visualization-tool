class BaseIndex:
    def __init__(self):
        self.index = None
        self.has_index = False
        self.has_vectors = False

        self.vectors = []
        self.dim = 0

    def set_vectors(self, vectors):
        self.has_vectors = True
        self.vectors = vectors
        self.dim = len(vectors[0])
        self.build()
