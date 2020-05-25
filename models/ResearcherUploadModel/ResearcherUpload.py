"""
    * Currenty there is a table as many to many connections with an associated table as a middleman
    * need a table object and not a model as per the documentation of flask-sqlAlchemy
"""
def generate_model(db):
    name= 'Researcher_Upload'
    return name,db.Table(name,
                    db.Column('ResearcherID', db.Integer, db.ForeignKey(
                        'Researcher.ID'), primary_key=True),
                    db.Column('UploadID', db.Integer, db.ForeignKey('Upload.ID'), primary_key=True),
                    extend_existing = True)


def generate_relations(db, models):
    pass
