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
#from .appcreator import Appcreator
import tempfile
from flask_login import current_user, login_user, logout_user
from DBL_HTI import create_app
"""
    The creation of the app is now a function in appcreator so that you can call
    the app from other locations.
"""

app = create_app()


visualizations = [
    {'name': 'Scatter Plot', 'link': 'scatterPlot'},
    {'name': 'Heatmap', 'link': 'heatmap'},
    {'name': 'Gaze Plot', 'link': 'gazePlot'},
    {'name': 'Gaze Stripes', 'link': 'gazeStripes'},
]

@app.route('/')
def main():
    return render_template('index.html',
                           visualizations=visualizations,
                           loggedIn = str(current_user.is_authenticated).lower())

"""
    * At some point (when we get stimuli from the database) this becomes obsolete.
"""
@app.route('/stimuliNames')
def stimuliNames():
    files = os.listdir('./static/stimuli')
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
    * The front end ends the username and password to this route. Then firstly
    * we check if the current_user is logged in, this is a part of flask-login.
    * The current_user is the client, and it has a boolean attribute called is_authenticated.
    * Using the DatabaseInsert class we can use the method for loggin in. First we
    * get the Researcher that has the given username. Then we send that to the login method of DatabaseInsert.
    * In the login method we check the passwords and return a True or False boolean.
"""
@app.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return "You are already logged in."
    dbinsobj = DatabaseInsert()
    username = request.form['username']
    password = request.form['password']
    user = Researcher.query.filter_by(Username=username).first() # query the right user
    if user is None or not dbinsobj.login(user, password): #check if the user exists and if the password is correct
        return 'Wrong username or password', 401
    login_user(user) # The function from flask-login that sets the current_user to the queried user.
    return 'Succesfully logged in!'

"""
    * Using the DatabaseInsert class we can use the method for registering.
    * Then based on the succes of registering we return the right string.
    * Like the login route we get the username and password from the frontend.
    * The creation of a new user happens in the register method of DatabaseInsert.
"""
@app.route('/register', methods =['POST'])
def register():
    dbinsobj = DatabaseInsert()
    username = request.form['username']
    password = request.form['password']
    success = dbinsobj.register(username, password)
    if success:
        return 'Succesfully created account!'
    else:
        return 'Username already exists', 403

"""
    * When the frontend sends the user to this route we check if the user is authenticated
    * and if so we log the user out. If not we return the string saying that the user
    * wasn't logged in in the first place.
"""
@app.route('/logout', methods=["GET"])
def logout():
    if current_user.is_authenticated:
        logout_user()
        return "You're logged out."
    else:
        return "You weren't logged in."

@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data_all(stimulus):
    filtered_data =get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return get_clustered_data_from_frame(filtered_data).to_json()

@app.route('/clusters/<stimulus>/<user>', methods=['GET'])
def get_clustered_data_user(stimulus, user):
    filtered_data = get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus, user)
    return get_clustered_data_from_frame(filtered_data).to_json()
