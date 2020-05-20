from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
import shutil
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from .models.Stimuli import Stimuli
from .models.Researcher import Researcher
from .utils.zipfiles import sort_zip
from .utils.insert import *
from .appcreator import Appcreator
import tempfile
"""
    The creation of the app is now a function in appcreator so that you can call
    the app from other locations.
"""
creatorobject = Appcreator()

app = creatorobject.create_app()
db = creatorobject.db

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

@app.route('/login', methods=['POST'])
def login():
    username= request.form['username']
    password = request.form['password']
    user_exists = db.session.query(db.exists().where(and_(Researcher.Username==username, Researcher.Password==password))).scalar()
    if user_exists:
        return 'Logged in'
    else:
        return 'Wrong username or password', 401

@app.route('/register', methods =['POST'])
def register():
    username= request.form['username']
    password = request.form['password']
    user_exists = db.session.query(db.exists().where(Researcher.Username==username)).scalar()
    if user_exists:
        return 'Username already exists', 403
    else:
        new_researcher = Researcher(Username=username, Password=password)
        db.session.add(new_researcher)
        db.session.commit()
        return 'Succesfully created account!'
    


@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data_all(stimulus):
    filtered_data =get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return get_clustered_data_from_frame(filtered_data).to_json()

@app.route('/clusters/<stimulus>/<user>', methods=['GET'])
def get_clustered_data_user(stimulus, user):
    filtered_data = get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus, user)
    return get_clustered_data_from_frame(filtered_data).to_json()    
