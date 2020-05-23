from flask import Flask, render_template, request, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os
import importlib
"""
    * This function will create the app object. To put this into its own file is
    * necessary in order for SQLAlchemy to get the right app and database it needs
    * to work with.


    * The configuration is the connection with the database. First postgres is the 'owner' of the database,
    * Then we have the password of that user, @localhost is the address of the database (later we can use '1.2.3.4:5678'
    * as the actual server ip and port of the database), then we have /DBL_HTIdb that is the database on the server we want to use.
"""


class ApplicationState():
    def __init__(self):
        self.__db = SQLAlchemy()
        self.__app = Flask(__name__, static_folder="static")
        self.__models ={}
        self.init_app()
        self.init_db()

    def init_app(self):
        self.__app.config['ZIP_UPLOAD'] = 'uploads'
        self.__app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.__app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb'
        # Initializes the db object that was created in the initialization
        self.__db.init_app(self.__app)
        self.__app.teardown_appcontext(lambda e: self.db.session.remove())

    def init_db(self):
        for name in os.listdir('models/'):
            if name.startswith('__'):
                continue
            path = '.models.{}'.format(name)
            modelName = name.replace('Model','')
            module = importlib.import_module(path,__package__)
            self.__models[modelName] = module.generate_model(self.db)

    @property
    def app(self):
        return self.__app

    @property
    def db(self):
        return self.__db
    
    @property
    def models(self):
        return self.__models
