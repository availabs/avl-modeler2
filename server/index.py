import json
import sqlite3
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS, cross_origin


app = Flask(__name__)
cors = CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'


def get_db_connection():
    conn = sqlite3.connect('database/activitysimserver.sqlite')
    conn.row_factory = row_to_dict
    return conn


def row_to_dict(cursor: sqlite3.Cursor, row: sqlite3.Row) -> dict:
    data = {}
    for idx, col in enumerate(cursor.description):
        data[col[0]] = row[idx]
    return data


@app.route('/')
@cross_origin(supports_credentials=True)
def index():
    return 'Server Works!'


@app.route('/greet')
def say_hello():
    return 'Hello from Server'


@app.route('/projects/<userId>')
def projectsByUser(userId):
    conn = get_db_connection()
    projects = conn.execute(
        'SELECT a.id, a.Name as name, a.geoList as geo_list, a.options  FROM projects_users INNER JOIN projects as a ON projects_users.project_id=a.id WHERE projects_users.user_id=?', (userId,)).fetchall()
    return jsonify(projects)

# @app.route('/pums/psam/<type>/<puma_id>')
# def projectsByUser(type,puma_id):
#     conn = get_db_connection()
#     projects = conn.execute(
#         'SELECT a.id, a.Name as name, a.geoList as geo_list, a.options  FROM projects_users INNER JOIN projects as a ON projects_users.project_id=a.id WHERE projects_users.user_id=?', (userId,)).fetchall()
#     return jsonify(projects)


# @app.route('/pums/psam/h/<puma_id>')
# def pumaHdataById(puma_id):
#     conn = get_db_connection()
#     projects = conn.execute(
#         'SELECT * FROM psam_h36  WHERE psam_h36.PUMA=?', (puma_id,)).fetchall()
#     return jsonify(projects)


# @app.route('/pums/psam/p/<puma_id>')
# def pumaPdataById(puma_id):
#     conn = get_db_connection()
#     projects = conn.execute(
#         'SELECT * FROM psam_p36  WHERE psam_p36.PUMA=?', (puma_id,)).fetchall()
#     return jsonify(projects)

# @app.route('/pums/psam/<type>/<puma_id>')
# def pumaDataById(type, puma_id):
#     conn = get_db_connection()
#     projects = conn.execute(
#         'SELECT * FROM psam_h36  WHERE psam_?36.PUMA=?', (type, puma_id,)).fetchall()
#     return jsonify(projects)


@app.route('/pums/psam/<type>/<puma_id>')
def pumaDataById(type, puma_id):
    conn = get_db_connection()
    if type == "h":
        projects = conn.execute(
            'SELECT * FROM psam_h36  WHERE psam_h36.PUMA=?', (puma_id,)).fetchall()
        return jsonify(projects)
    elif type == "p":
        projects = conn.execute(
            'SELECT * FROM psam_p36  WHERE psam_p36.PUMA=?', (puma_id,)).fetchall()
        return jsonify(projects)


@app.route('/project/create', methods=['POST'])
def projectCreate():
    # check user details from db
    print("post success")
    request_data = request.json
    # print(request_data['userId'], request_data)
    # return jsonify(request_data)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO projects values (?, ?, ?, ?)', (None, request_data['project_name'], None, None))

    print("project ID", cursor.lastrowid, " is successfully inserted")

    cursor.execute(
        'INSERT INTO projects_users values (?, ?)', (request_data['userId'], cursor.lastrowid))
    conn.commit()

    return "inserted"
