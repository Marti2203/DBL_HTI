from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from .models.Stimuli import Stimuli
from .utils.zipfiles import sort_zip
from .utils.insert import *
from .appcreator import Appcreator

"""
    The creation of the app is now a function in appcreator so that you can call
    the app from other locations.
"""
creatorobject = Appcreator()
app = creatorobject.create_app()

# -- The following code has to do with the database:
# Before you want to use the app with the database you must have postgresql installed
# and have a database called DBL_HTIdb with a table called stimuli.
# The database step will become unnecissary when we have a server and the database is hosted there.
# You will also need to do "pip install flask flask_sqlalchemy" to install SQLAlchemy

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
    res = json.dumps(files)
    return res

@app.route('/uploadzip', methods=['POST'])
def upload_zip(): #takes in uploaded zip and sorts it to destinations by filetype. formating of csv still needed.
    file_dict = request.files.to_dict()
    file = file_dict['uploaded_zip']
    file.save(os.path.join(app.config['ZIP_UPLOAD'], 'uploaded_zip.zip')) #save zip in main folder
    sort_zip() #sends files from zip to right place, (dataframe processing happens here, found in zipfiles.py)
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
    print(user_exists)
    print(password)
    if user_exists:
        return 'Logged in'
    else:
        return 'Wrong username or password', 401

@app.route('/register', methods =['POST'])
def register():
    username= request.form['username']
    password = request.form['password']
    user_exists = db.session.query(db.exists().where(Researcher.Username==username)).scalar()
    print(user_exists)
    if user_exists:
        return 'Username already exists', 403
    else:
        new_researcher = Researcher(Username=username, Password=password)
        db.session.add(new_researcher)
        db.session.commit()
        return 'Succesfully created account!'
    


@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data(stimulus):
    filtered_data =get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return get_clustered_data_from_frame(filtered_data).to_dict()
