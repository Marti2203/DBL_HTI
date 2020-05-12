from flask import Flask, render_template, request, jsonify
from .utils.data_processing import *
import os
import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
app = Flask(__name__, static_folder="static")
from .models.sharedmodel import db
from .models.Stimuli import Stimuli
from .models.Researcher import Researcher
visualizations = [
    {'name': 'Visualization 1', 'link': 'vis1'},
    #{'name': 'Visualization 2', 'link': 'vis2'},
]


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


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb'
"""
    * Above configuration is the connection with the database. First postgres is the 'owner' of the database,
    * Then we have the password of that user, @localhost is the address of the database (later we can use '1.2.3.4:5678'
    * as the actual server ip and port of the database), then we have /DBL_HTIdb that is the database on the server we want to use.
"""
db.init_app(app)

# Demo route to see that you can manualy insert a stimulus (proof of concept)
"""
    * The user types localhost:5000/insert/Antwerp in to store 'Antwerp' in the database.
    * The newStimulus variable is the new row of the stimuli table, this is an object of the model of the table.
    * With db.session.add and db.session.commit you first add the new row to the list of new changes and you then
    * commit them to the database.
"""
@app.route('/insert/<stimulus>')
def index(stimulus):
    varstim = Stimuli(Stimuli=stimulus)
    db.session.add(varstim)
    db.session.commit()
    return 'Added stimulus {}'.format(stimulus)


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
    

