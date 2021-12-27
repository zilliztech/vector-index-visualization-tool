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
    key_attr = request.form.get('key', 'name')
    vector_attr = request.form.get('vector', 'vector')
    rows = csv.DictReader(io.StringIO(str(fileRead, encoding="utf-8")))
    data = [row for row in rows]
    index.set_data(data, key_attr, vector_attr)

    print('Set Data')
    return jsonify(successMsg)


@app.route("/set_index_type")
def set_index_type():
    index_type = json.loads(request.args.get('index_type', 'hnsw'))
    print('Set index type:', index_type)
    index.set_index_type(index_type)
    return jsonify(successMsg)


@app.route("/set_build_params")
def set_build_params():
    params = json.loads(request.args.get('params', "{}"))
    print('Set build params:', params)
    index.set_build_params(params)
    return jsonify(successMsg)


@app.route("/set_search_params")
def set_search_params():
    params = json.loads(request.args.get('params', "{}"))
    print('Set search params:', params)
    index.set_search_params(params)
    return jsonify(successMsg)


@app.route("/search_by_id")
def get_search_vis_data():
    id = json.loads(request.args.get('id', 0))
    # res = index.search_by_id(id)
    # msg = 'ok'
    try:
        res = index.search_by_id(id)
        msg = 'ok'
    except:
        res = {}
        msg = 'failed'
    return jsonify({'data': res, 'msg': msg})


@app.route("/get_corase_vis_data")
def get_corase_vis_data():
    res = index.get_corase_vis_data()
    return jsonify({'data': res, 'msg': 'ok'})


@app.route("/set_vis_params")
def set_vis_params():
    params = json.loads(request.args.get('params', "{}"))
    print('Set vis params:', params)
    project_method = params.get('project_method', '')
    if len(project_method) == 0:
        project_method = 'umap'
    project_params = params.get('project_params', "{}")
    projection.set_method(project_method, project_params)
    return jsonify(successMsg)


@app.route('/images/<filename>')
def get_file_by_name(filename):
    print('get image by name:', filename)
    return send_from_directory('./data/images', filename)


@app.route('/image_id/<fileId>')
def get_image_by_id(fileId):
    filename = index.data.id2key(fileId)
    print('get image by id (%s): %s' % (fileId, filename))
    return send_from_directory('./data/images', filename)


# @app.route('/test_id/<fileId>')
# def get_test_file_by_id(fileId):
#     filename = index.data.test_id2key(fileId)
#     print(fileId, filename)
#     return send_from_directory('./data/images', filename)


if __name__ == '__main__':
    app.run(debug=False, port=12357)
