from project_utils import projection
import json
import io
import csv
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
import sys
import os
# compatibility when run in 'server/'
server_dir = 'server'
if server_dir in os.path.basename(os.getcwd()):
    sys.path.append('./index')
else:
    sys.path.append('./server/index')
from index_manage import Index


app = Flask(__name__)
CORS(app)

successMsg = {
    'code': 200,
    'message': 'ok'
}

index = Index()


@app.route("/set_data", methods=['POST'])
def set_data():
    fileRead = request.files['file'].stream.read()
    rows = csv.DictReader(io.StringIO(str(fileRead, encoding="utf-8")))
    data = [row for row in rows]
    index.set_data(data)
    return jsonify(successMsg)


@app.route("/set_index_type")
def set_index_type():
    index_type = request.args.get('index_type', 'hnsw')
    index.set_index_type(index_type)
    return jsonify(successMsg)


@app.route("/set_build_params")
def set_build_params():
    params = json.loads(request.args.get('params', "{}"))
    index.set_build_params(params)
    return jsonify(successMsg)


@app.route("/set_search_params")
def set_search_params():
    params = json.loads(request.args.get('params', "{}"))
    index.set_search_params(params)
    return jsonify(successMsg)


@app.route("/search_by_id")
def get_search_vis_data():
    id = int(request.args.get('id', 0))
    res = index.search_by_id(id)
    return jsonify(res)


@app.route("/set_projection_method")
def set_projection_method():
    method = request.args.get('method', 'umap')
    params = json.loads(request.args.get('params', "{}"))
    projection.set_method(method, params)
    return jsonify(successMsg)


if __name__ == '__main__':
    app.run(debug=False, port=12357)
