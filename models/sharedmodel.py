"""
    * In this module we create the database object. Note that the object
    * is not yet initiated, this will happen in app.py. This module is
    * to be called by the models in the folder models. This ensures the
    * scope is includes the db object.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
