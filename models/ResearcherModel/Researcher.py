"""
    * This class is a model of a table in the database. This specific class is
    * the model of the 'Researcher' table. All the columns of the table are
    * in this class too, with corresponding datatypes.
    * The db object gets imported from the package (the __init__.py file).
    * The Researcher class extends the UserMixin class from flask-login. That means
    * that the class has certain variables that flask-login needs. We do override the get_id
    * method because we use a specific name for the id (ResearcherId) instead of a
    * generic column name (id). The @login.user_loader makes sure that the flask-log
    * library / module can get acces to specific users.
"""
from flask_login import UserMixin


def generate_model(db, login):
    name = 'Researcher'

    class Researcher(UserMixin, db.Model):
        __tablename__ = name
        ID = db.Column(db.Integer, primary_key=True, unique=True)
        Username = db.Column(db.String, unique=True)
        Password = db.Column(db.LargeBinary)

        def get_id(self):
            return (self.ID)

    @login.user_loader
    def load_user(id):
        return Researcher.query.get(int(id))

    return name, Researcher


def generate_relations(db, models):
    models['Researcher'].Uploads = db.relationship(
        "Upload", secondary=models['Researcher_Upload'])
