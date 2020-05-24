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


def generate_model(db):
    name = 'UploadRow'

    class UploadRow(db.Model):
        __tablename__ = name
        ID = db.Column(db.Integer, primary_key=True)
        UploadID = db.Column(db.Integer, db.ForeignKey('Upload.ID'))
        Timestamp = db.Column(db.Integer)
        FixationIndex = db.Column(db.Integer)
        FixationDuration = db.Column(db.Integer)
        MappedFixationPointX = db.Column(db.Integer)
        MappedFixationPointY = db.Column(db.Integer)
        user = db.Column(db.String)
        description = db.Column(db.String)
        StimuliName = db.Column(db.String)
    return name, UploadRow


def generate_relations(db, models):
    pass
