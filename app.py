from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__, static_folder="static")

visualizations = [
    {'name': 'Visualization 1', 'link': 'vis1'},
    {'name': 'Visualization 2', 'link': 'vis2'},
]

@app.route('/')
def main():
    return render_template('helloworld.html',
                           visualizations=visualizations)

@app.route('/upload')
def upload():
    return render_template('upload.html')


@app.route('/vis1')
def vis1():
    return render_template('vis1.html')

#-- The following code has to do with the database:
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

db = SQLAlchemy(app)

"""
    * This class is a model of a table in the database. This specific class is the model of the 'stimuli' table.
    * 'Index' and 'Stimuli' are the columns in the table we can fill with the set datatypes.
"""
class stimuli(db.Model):
    Index = db.Column(db.Integer, primary_key=True)
    Stimuli = db.Column(db.String)


# Demo route to see that you can manualy insert a stimulus (proof of concept)
"""
    * The user types localhost:5000/insert/Antwerp in to store 'Antwerp' in the database.
    * The varstim variable is the new row of the stimuli table, this is an object of the model of the table.
    * With db.session.add and db.session.commit you first add the new row to the list of new changes and you then
    * commit them to the database.
"""
@app.route('/insert/<stimulus>')
def index(stimulus):
    varstim = stimuli(Stimuli=stimulus)
    db.session.add(varstim)
    db.session.commit()

    return '<h1>Added New Stimulus!</h1>'
