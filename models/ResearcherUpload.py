"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Researcher_Upload' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
"""

from DBL_HTI.appcreator import Appcreator
creatorobject = Appcreator()
db = creatorobject.return_db()

class ResearcherUpload(db.Model):
    __tablename__ = 'Researcher_Upload'
    ResearcherId = db.Column(db.Integer, db.ForeignKey('Researcher.ResearcherId'), primary_key=True)
    UploadId = db.Column(db.Integer,db.ForeignKey('Upload.UploadId'), primary_key=True)
