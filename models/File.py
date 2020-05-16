"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'File' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
    !!! Note this is a placeholder of sorts, this class may be seen as a
    !!! template of the table.
"""

from DBL_HTI.appcreator import Appcreator
creatorobject = Appcreator()
db = creatorobject.db

class File(db.Model):
    __tablename__ = 'File'
    Index = db.Column(db.Integer, primary_key=True)
    Timestamp = db.Column(db.Integer)
    StimuliName = db.Column(db.String)
    FixationIndex = db.Column(db.Integer)
    FixationDuration = db.Column(db.Integer)
    MappedFixationPointX = db.Column(db.Integer)
    MappedFixationPointY = db.Column(db.Integer)
    user = db.Column(db.String)
    description = db.Column(db.String)
