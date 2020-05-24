"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Researcher' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported for the sharedmodel module. DBL_HTI is the
    * name of the projectfolder. You might have to change it to your own
    * foldername.
"""


def generate_model(db):
    name = 'Researcher'
    class Researcher(db.Model):
        __tablename__ = name
        ID = db.Column(db.Integer, primary_key=True, unique=True)
        Username = db.Column(db.String, unique=True)
        Password = db.Column(db.LargeBinary)
    return name,Researcher


def generate_relations(db, models):
    models['Researcher'].Uploads = db.relationship(
        "Upload", secondary=models['Researcher_Upload'])
