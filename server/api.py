import json
import io
import csv
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
import sys
import os
# compatibility when run in server
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


@app.route("/set_data", methods=['POST'])
def set_data():
    fileRead = request.files['file'].stream.read()
    rows = csv.reader(io.StringIO(str(fileRead, encoding="utf-8")))
    data = [row for row in rows]
    return jsonify(successMsg)
