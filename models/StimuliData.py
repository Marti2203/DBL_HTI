"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'stimuli' table. 'Index' and 'Stimuli' are the columns
    * in the table we can fill with the set datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
"""

from DBL_HTI.appcreator import Appcreator
creatorobject = Appcreator()
db = creatorobject.db

class StimuliData(db.Model):
    __tablename__ = 'StimuliData'
    ID = db.Column(db.Integer, primary_key=True)
    UploadID = db.Column(db.Integer, db.ForeignKey('"Upload"."ID"'))
    Participants = db.Column(db.ARRAY(db.String))
    ClusterData = db.Column(db.JSON)
