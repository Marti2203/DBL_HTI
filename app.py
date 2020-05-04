from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
from flask_sqlalchemy import SQLAlchemy
from .models.sharedmodel import db
from .models.Stimuli import Stimuli

app = Flask(__name__, static_folder="static")

# -- The following code has to do with the database:
# Before you want to use this you must have postgresql installed and have a database called DBL_HTIdb with a table called stimuli.
# The database step will become unnecissary when we have a server and the database is hosted there.
# You will also need to do "pip install flask flask_sqlalchemy" to install SQLAlchemy

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb'
"""
    * Above configuration is the connection with the database. First postgres is the 'owner' of the database,
    * Then we have the password of that user, @localhost is the address of the database (later we can use '1.2.3.4:5678'
    * as the actual server ip and port of the database), then we have /DBL_HTIdb that is the database on the server we want to use.
"""
db.init_app(app) # Initializes the db object that was created in sharedmodel.py

visualizations = [
    {'name': 'Visualization 1', 'link': 'vis1'},
    {'name': 'Visualization 2', 'link': 'vis2'},
]
@app.route('/login', methods=["POST"])
def login():
    return "1"


@app.route('/')
def main():
    return render_template('helloworld.html',
                           visualizations=visualizations)

@app.route('/upload')
def upload():
    return render_template('upload.html')


@app.route('/stimuliNames')
def stimuliNames():
    files = os.listdir('./static/stimuli')
    res = json.dumps(files)
    return res


# Demo route to see that you can manualy insert a stimulus (proof of concept)
"""
    * The user types localhost:5000/insert/Antwerp in to store 'Antwerp' in the database.
    * The newStimulus variable is the new row of the stimuli table, this is an object of the model of the table.
    * With db.session.add and db.session.commit you first add the new row to the list of new changes and you then
    * commit them to the database.
"""
@app.route('/insertStimulus/<stimulus>', methods=['POST'])
def insert(stimulus):
    newStimulus = Stimuli(Stimuli=stimulus)
    db.session.add(newStimulus)
    db.session.commit()
    return 'Added stimulus {}'.format(stimulus)


@app.route('/users/<stimulus>', methods=['GET'])
def get_users(stimulus):
    users = get_users_for_stimuli('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return json.dumps(users)


@app.route('/clusters/<stimulus>', methods=['GET'])
def get_clustered_data(stimulus):
    filtered_data = data_processing.get_filtered_data_for_stimulus('./static/csv/all_fixation_data_cleaned_up.csv', stimulus)
    return data_processing.get_clustered_data_from_frame(filtered_data).to_json()
