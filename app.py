from flask import Flask, render_template, request, jsonify, send_from_directory
from .utils.data_processing import *
import os
import json
import shutil
from .utils.zipfiles import process_zip
from .utils.insert import *
from flask import send_from_directory
from werkzeug.utils import secure_filename
import tempfile
from flask_login import current_user, login_user, logout_user, login_required
from DBL_HTI import create_app, modelsdict
from sqlalchemy import and_
import pandas as pd
"""
    The creation of the app is now a function in appcreator so that you can call
    the app from other locations.
"""


def row2dict(r): return {c.name: str(getattr(r, c.name))
                         for c in r.__table__.columns}


app = create_app()


visualizations = [
    {'name': 'Heatmap', 'link': 'heatmap'},
    {'name': 'Scatter Plot', 'link': 'scatterPlot'},
    {'name': 'Gaze Plot', 'link': 'gazePlot'},
    {'name': 'Gaze Stripes', 'link': 'gazeStripes'},
]


@app.route('/')
def main():
    return render_template('index.html',
                           visualizations=visualizations,
                           sidebar_components = os.listdir(os.path.join('.','static','js','sidebarComponents')),
                           loggedIn=str(current_user.is_authenticated).lower(),
                           username=current_user.Username if current_user.is_authenticated else '',
                           vue_link=app.config['VUE_LINK'])


ALLOWED_EXTENSIONS = ['zip']


def allowed_file(name):
    return '.' in name and name.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/uploadzip', methods=['POST'])
@login_required
# takes in uploaded zip and sorts it to destinations by filetype. formating of csv still needed.
def upload_zip():
    id = current_user.get_id()
    file = request.files.to_dict()['uploaded_zip']
    if not allowed_file(file.filename):
        return "Only archives of type {} are acceptable!".format(ALLOWED_EXTENSIONS), 401

    temporary_directory = tempfile.mkdtemp()
    try:
        file_name = secure_filename(file.filename)
        folder_name = file_name.split('.')[0]
        file_path = os.path.join(temporary_directory, file_name)

        file.save(file_path)  # save zip in a temporary folder

        shutil.copytree(temporary_directory, os.path.join(
        'uploads', str(id), folder_name))
        # sends files from zip to right place, (dataframe processing happens here, found in zipfiles.py)
        process_zip(temporary_directory, file_name)


        return 'Uploaded successfully'
    except Exception as e:
        if type(e).__name__ == "FileExistsError":
            return "The submitted file already exists.", 500
        else:
            print(e)
            return "Could not upload file successfully", 500
    finally:
        shutil.rmtree(temporary_directory)
    return 'Uploaded?'


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
    user = modelsdict['Researcher'].query.filter_by(
        Username=username).first()  # query the right user
    # check if the user exists and if the password is correct
    if user is None or not dbinsobj.login(user, password):
        return 'Wrong username or password', 401
    # The function from flask-login that sets the current_user to the queried user.
    login_user(user)
    return 'Succesfully logged in!'


"""
    * Using the DatabaseInsert class we can use the method for registering.
    * Then based on the succes of registering we return the right string.
    * Like the login route we get the username and password from the frontend.
    * The creation of a new user happens in the register method of DatabaseInsert.
"""
@app.route('/register', methods=['POST'])
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


"""
    * Returns an array with the id and filename of all the uploads that are made by the
    * logged in user. Because the researcher class has a relation with the Researcher_Upload
    * table we don't need to query for those specific ids.
"""
@app.route('/datasets', methods=["GET"])
@login_required
def list_datasets():
    Upload = modelsdict['Upload']
    researcher = current_user
    res = list(map(lambda arr: {'ID': arr[0], 'Name': arr[1], 'FileName': arr[2]}, researcher.Uploads.with_entities(
        Upload.ID, modelsdict['Upload'].DatasetName, Upload.FileName).all()))
    return json.dumps(res)

@app.route('/download/<name>', methods=['GET', 'POST'])
@login_required
def downloadDataset(name):
    id = str(current_user.get_id())
    filename = name + ".zip"
    try:
        return send_from_directory(os.path.join(app.root_path, "uploads", id, name), filename=filename, as_attachment=True)
    except FileNotFoundError:
        return "File not found",404

"""
    * This returns the stimuli names from the database.
"""
@app.route('/stimuliNames/<int:id>', methods=["GET"])
@login_required
def list_stimuli(id):
    res = current_user.Uploads.filter(modelsdict['Upload'].ID == id).one()
    return json.dumps(res.Stimuli)


"""
    * This route returns all the participants for a specific dataset and a specific stimulus.
"""
@app.route('/participants/<int:id>/<stimulus>', methods=['GET'])
@login_required
def get_participants(id, stimulus):
    res = current_user.Uploads.filter(
        modelsdict['Upload'].ID == id).one().StimuliData.filter(modelsdict['StimuliData'].StimuliName == stimulus).one()
    return json.dumps(res.Participants)


"""
    * This route returns all the data for a specific dataset and a specific stimulus.
"""
@app.route('/data/<int:id>/<stimulus>')
@login_required
def get_data(id, stimulus):
    upload = current_user.Uploads.filter(modelsdict['Upload'].ID == id).one()
    res = list(map(row2dict, upload.UploadRows.filter(
        modelsdict['UploadRow'].StimuliName == stimulus).all()))
    return json.dumps(res)


"""
    * Gets the right UploadRows and puts them into a dataframe to be processed.
    * We then calculate the clusters and return it as json.
"""
@app.route('/clusters/<int:id>/<stimulus>', methods=['GET'])
@login_required
def get_clustered_data_all(id, stimulus):
    upload = current_user.Uploads.filter(modelsdict['Upload'].ID == id).one()
    res = list(map(row2dict, upload.UploadRows.filter(
        modelsdict['UploadRow'].StimuliName == stimulus).all()))
    df = pd.DataFrame(res)
    calculated_clusters = get_clustered_data_from_frame(df)
    return calculated_clusters.to_json()


"""
    * Does the same as get_clustered_data_all but for a specific user.
"""
@app.route('/clusters/<int:id>/<stimulus>/<user>', methods=['GET'])
@login_required
def get_clustered_data_user(id, stimulus, user):
    upload = current_user.Uploads.filter(modelsdict['Upload'].ID == id).one()
    res = list(map(row2dict, upload.UploadRows.filter(and_(
        modelsdict['UploadRow'].StimuliName == stimulus, modelsdict['UploadRow'].user == user)).all()))
    df = pd.DataFrame(res)
    numerical = ["Timestamp", "FixationDuration", "FixationIndex",
                 "MappedFixationPointX", "MappedFixationPointY"]
    df[numerical] = df[numerical].apply(pd.to_numeric)
    caclulated_clusters = get_clustered_data_from_frame(df)
    return caclulated_clusters.to_json()


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')


@app.route('/uploads/stimuli/<dataset>/<filename>')
@login_required
def upload(dataset, filename):
    path = os.path.join(app.root_path, 'uploads', str(
        current_user.get_id()), dataset, 'stimuli')
    name = filename.split('/')[-1]
    return send_from_directory(path, name)
