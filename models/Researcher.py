"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Researcher' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
"""

from DBL_HTI.appcreator import Appcreator
creatorobject = Appcreator()
db = creatorobject.db

class Researcher(db.Model):
    __tablename__ = 'Researcher'
    ResearcherId = db.Column(db.Integer, primary_key=True)
    Username = db.Column(db.String)
    Password = db.Column(db.Binary)
