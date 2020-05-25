from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from .config import Config
import os
import importlib

"""
    * The system runs this file when we start the app. By putting variables like db in here
    * these variables become sort of global. We can import them from the package. The configuration
    * of the app is now in config.py, it is a class and its attributes are the config strings for the app.
"""

db = SQLAlchemy()
login = LoginManager()
login.login_view = 'login'
modelsdict = {}

def create_app(config_class=Config):
    def create_models(db):
        global modelsdict
        relations = []
        for name in os.listdir('models/'):
            if name.startswith('__'):
                continue
            path = '.models.{}'.format(name)
            module = importlib.import_module(path, __package__)
            name, model = module.generate_model(db)
            modelsdict[name] = model
            relations.append(module.generate_relations)
        for func in relations:
            func(db, modelsdict)

    app = Flask(__name__, static_folder="static")
    app.config.from_object(config_class)

    db.init_app(app)
    login.init_app(app)
    create_models(db)

    return app
