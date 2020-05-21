"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Researcher' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
"""
from sqlalchemy import Table, Column, Integer,LargeBinary,String, ForeignKey
from sqlalchemy.orm import relationship
from DBL_HTI.appcreator import Appcreator
from .ResearcherUpload import ResearcherUpload
creatorobject = Appcreator()
db = creatorobject.db

class Researcher(db.Model):
    __tablename__ = 'Researcher'
    ID = db.Column(Integer, primary_key=True,unique=True)
    Username = db.Column(String, unique=True)
    Password = db.Column(LargeBinary)
    Upload = relationship("Upload", secondary="ResearcherUpload")
