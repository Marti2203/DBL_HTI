from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
from flask_sqlalchemy import SQLAlchemy
#from .models.sharedmodel import db
from .models.Stimuli import Stimuli
from .zipfiles import sort_zip
from .insert import *
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

# Demo route to see that you can manualy insert a stimulus (proof of concept)
"""
    * The user types localhost:5000/insert/Antwerp in to store 'Antwerp' in the database.
    * The newStimulus variable is the new row of the stimuli table, this is an object of the model of the table.
    * With db.session.add and db.session.commit you first add the new row to the list of new changes and you then
    * commit them to the database.
"""

@app.route('/users/<stimulus>', methods=['GET'])
def get_users(stimulus):
    users = get_users_for_stimuli('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return json.dumps(users)

# This is a test route:
@app.route('/inserttables', methods=["GET", "POST"])
def inserttables():
    newInsert = DatabaseInsert()
    newInsert.main()
    d = {'Timestamp': [2586, 2836], 'StimuliName': ['01_Antwerpen_S1.jpg', '01_Antwerpen_S1.jpg'],
        'FixationIndex': [9, 10], 'FixationDuration': [250, 150], 'MappedFixationPointX': [1151, 1371],
        'MappedFixationPointY': [458, 316], 'user': ['p1', 'p1'], 'description': ['color', 'color']}
    df = pd.DataFrame(data=d)
    newInsert.insertCSV(df)
    return "Tables created!"

# This is a test route:
@app.route('/getindex', methods=['GET', 'POST'])
def getindex():
    newInsert = DatabaseInsert()
    return str(newInsert.QueryLastIndex())


@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data(stimulus):
    filtered_data =get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return get_clustered_data_from_frame(filtered_data).to_dict()
