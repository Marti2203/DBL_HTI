"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Upload' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
    !!! Note this is a placeholder of sorts, this class may be seen as a
    !!! template of the table.
"""
from sqlalchemy.orm import relationship
from DBL_HTI.appcreator import Appcreator
creatorobject = Appcreator()
db = creatorobject.db

class Upload(db.Model):
    __tablename__ = 'Upload'
    ID = db.Column(db.Integer, primary_key=True)
    Created = db.Column(db.DateTime(timezone=False))
    FileName = db.Column(db.String)
    Stimuli = db.Column(db.ARRAY(db.String))
    UploadRows = relationship('"UploadRow"')
    StimuliData = relationship('"StimuliData"')
    Upload = relationship("Researcher", secondary="ResearcherUpload")
