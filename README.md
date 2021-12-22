# data-visualization-tool

## Overview

本工作为similarity search过程提供可视化展示。
目前支持IVFFlat、HNSW这两个索引。

包括以下几个部分
- Similarity search过程中的向量访问记录
  - IVFFlat - from faiss-python api (todo link)
  - HNSWlib - modify the source cpp (todo link)
- Backend server
  - vector data store and mapping
  - index build / search
  - projection utils
- Web React - Visualization Views
  - Design for IVFFlat and HNSW
  - technical: including Voronoi, d3-force-links/radius/collision, DR project methods (pca, mds, t-sne, umap)


## Quick start

### Preparing

- new conda env
  - python >= 3.6
  - faiss (version?)
  - hnswlib-modify
    - download and install wheel directly.
    - compile (todo link).
- Clone this repo
```
git clone git@github.com:zilliztech/data-visualization-tool.git
```
- Run server
```
cd server/
python api.py
```
- Run web
```
yarn start
```

