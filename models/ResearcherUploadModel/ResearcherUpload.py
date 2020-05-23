"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Researcher_Upload' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
"""


def generate_model(db):
    return db.Table('ResearcherUpload',
                    db.Column('ResearcherID', db.Integer, db.ForeignKey(
                        'Researcher.ID'), primary_key=True),
                    db.Column('UploadID', db.Integer, db.ForeignKey('Upload.ID'), primary_key=True))


def generate_relations(db, models):
    pass
