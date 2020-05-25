from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from .config import Config

"""
    * The system runs this file when we start the app. By putting variables like db in here
    * these variables become sort of global. We can import them from the package. The configuration
    * of the app is now in config.py, it is a class and its attributes are the config strings for the app.
"""

db = SQLAlchemy()
login = LoginManager()
login.login_view = 'login'

def create_app(config_class=Config):
    app = Flask(__name__, static_folder="static")
    app.config.from_object(config_class)

    db.init_app(app)
    login.init_app(app)
    return app
