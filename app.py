from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
import shutil
from .utils.zipfiles import process_zip
from .utils.insert import *
from .appstate import ApplicationState
from flask import send_from_directory
from werkzeug.utils import secure_filename
import tempfile
"""
    The creation of the app is now a function in appcreator so that you can call
    the app from other locations.
"""
appstate = ApplicationState()
app = appstate.app
db = appstate.db

visualizations = [
    {'name': 'Scatter Plot', 'link': 'scatterPlot'},
    {'name': 'Heatmap', 'link': 'heatmap'},
    {'name': 'Gaze Plot', 'link': 'gazePlot'},
    {'name': 'Gaze Stripes', 'link': 'gazeStripes'},
]


@app.route('/')
def main():
    return render_template('index.html',
                           visualizations=visualizations)


@app.route('/stimuliNames')
def stimuliNames():
    files = os.listdir('./static/stimuli')
    files.sort()
    res = json.dumps(files)
    return res


ALLOWED_EXTENSIONS = ['zip']


def allowed_file(name):
    return '.' in name and name.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/uploadzip/<int:id>', methods=['POST'])
# takes in uploaded zip and sorts it to destinations by filetype. formating of csv still needed.
def upload_zip(id):
    print('id is {}'.format(id))
    file = request.files.to_dict()['uploaded_zip']
    if not allowed_file(file.filename):
        return "Only archives of type {} are acceptable!".format(ALLOWED_EXTENSIONS), 401

    temporary_directory = tempfile.mkdtemp()
    try:
        file_name = secure_filename(file.filename)
        file_path = os.path.join(temporary_directory, file_name)

        file.save(file_path)  # save zip in a temporary folder

        # sends files from zip to right place, (dataframe processing happens here, found in zipfiles.py)
        process_zip(appstate,id, temporary_directory, file_name)

        shutil.copytree(temporary_directory, os.path.join(
            'uploads', str(id)))

        return 'Uploaded successfully'
    finally:
        print('Deleted temp folder')
        shutil.rmtree(temporary_directory)
    return 'Upload failed', 500
    


@app.route('/users/<stimulus>', methods=['GET'])
def get_users(stimulus):
    users = get_users_for_stimuli(
        './static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return json.dumps(users)


"""
    * Using the DatabaseInsert class we can use the method for loggin in.
    * Then based on the succes of registering we return the right string.
"""
@app.route('/login', methods=['POST'])
def login():
    dbinsobj = DatabaseInsert(appstate)
    username = request.form['username']
    password = request.form['password']
    if dbinsobj.login(username, password):
        return 'Logged in'
    else:
        return 'Wrong username or password', 401


"""
    * Using the DatabaseInsert class we can use the method for registering.
    * Then based on the succes of registering we return the right string.
"""
@app.route('/register', methods=['POST'])
def register():
    dbinsobj = DatabaseInsert(appstate)
    username = request.form['username']
    password = request.form['password']
    success = dbinsobj.register(username, password)
    if success:
        return 'Succesfully created account!'
    else:
        return 'Username already exists', 403


@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data_all(stimulus):
    filtered_data = get_filtered_data_for_stimulus(
        './static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return get_clustered_data_from_frame(filtered_data).to_json()


@app.route('/clusters/<stimulus>/<user>', methods=['GET'])
def get_clustered_data_user(stimulus, user):
    filtered_data = get_filtered_data_for_stimulus(
        './static/csv/all_fixation_data_cleaned_up.csv', stimulus, user)
    return get_clustered_data_from_frame(filtered_data).to_json()


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

# this path needs to be secure
@app.route('/uploads/<id>/stimuli/<filename>')
def upload(id, filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads', secure_filename(id), 'stimuli'),  secure_filename(filename))
