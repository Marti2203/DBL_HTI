from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
import shutil
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from .utils.zipfiles import sort_zip
from .utils.insert import *
from .appstate import ApplicationState
from flask import send_from_directory
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

ALLOWED_EXTENSIONS=['zip','rar','7z']
def allowed_file(name):
    return '.' in name and name.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploadzip', methods=['POST'])
def upload_zip(): #takes in uploaded zip and sorts it to destinations by filetype. formating of csv still needed.
    file = request.files.to_dict()['uploaded_zip']
    if not allowed_file(file.filename):
        return "Only archives are acceptable!", 401

    temporary_directory = tempfile.mkdtemp()
    file_name = 'uploaded_zip.zip'
    file_path = os.path.join(temporary_directory, file_name)

    file.save(file_path) #save zip in a temporary folder

    sort_zip(temporary_directory ,file_name) #sends files from zip to right place, (dataframe processing happens here, found in zipfiles.py)

    shutil.rmtree(temporary_directory)
    return 'Uploaded successfully'

@app.route('/users/<stimulus>', methods=['GET'])
def get_users(stimulus):
    users = get_users_for_stimuli('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return json.dumps(users)

"""
    * Using the DatabaseInsert class we can use the method for loggin in.
    * Then based on the succes of registering we return the right string.
"""
@app.route('/login', methods=['POST'])
def login():
    dbinsobj = DatabaseInsert(appstate)
    username= request.form['username']
    password = request.form['password']
    if dbinsobj.login(username, password):
        return 'Logged in'
    else:
        return 'Wrong username or password', 401

"""
    * Using the DatabaseInsert class we can use the method for registering.
    * Then based on the succes of registering we return the right string.
"""
@app.route('/register', methods =['POST'])
def register():
    dbinsobj = DatabaseInsert(appstate)
    username= request.form['username']
    password = request.form['password']
    success = dbinsobj.register(username, password)
    if success:
        return 'Succesfully created account!'
    else:
        return 'Username already exists', 403



@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data_all(stimulus):
    filtered_data =get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return get_clustered_data_from_frame(filtered_data).to_json()

@app.route('/clusters/<stimulus>/<user>', methods=['GET'])
def get_clustered_data_user(stimulus, user):
    filtered_data = get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus, user)
    return get_clustered_data_from_frame(filtered_data).to_json()    


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),'favicon.ico')
