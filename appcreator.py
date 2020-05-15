from flask import Flask, render_template, request, jsonify, request
from flask_sqlalchemy import SQLAlchemy

"""
    * This function will create the app object. To put this into its own file is
    * necessary in order for SQLAlchemy to get the right app and database it needs
    * to work with.


    * The configuration is the connection with the database. First postgres is the 'owner' of the database,
    * Then we have the password of that user, @localhost is the address of the database (later we can use '1.2.3.4:5678'
    * as the actual server ip and port of the database), then we have /DBL_HTIdb that is the database on the server we want to use.
"""

class Appcreator():
    def __init__(self):
        self.db = SQLAlchemy()

    def create_app(self):
        app = Flask(__name__, static_folder="static")
        app.config['ZIP_UPLOAD'] = ''
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb'
        self.db.init_app(app) # Initializes the db object that was created in the initialization
        return app

    def return_db(self):
        return self.db
