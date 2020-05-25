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


def generate_model(db):
    name = 'Upload'
    class Upload(db.Model):
        __tablename__ = name
        __table_args__ = {'extend_existing': True}
        ID = db.Column(db.Integer, primary_key=True)
        Created = db.Column(db.DateTime(timezone=False))
        FileName = db.Column(db.String)
        Stimuli = db.Column(db.ARRAY(db.String))
        UploadRows = db.relationship('UploadRow')
        StimuliData = db.relationship('StimuliData')
    return name, Upload


def generate_relations(db, models):
    models['Upload'].Researcher = db.relationship(
        "Researcher", secondary=models['Researcher_Upload'])
