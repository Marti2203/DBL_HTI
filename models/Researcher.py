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
from DBL_HTI import db, login

class Researcher(UserMixin, db.Model):
    __tablename__ = 'Researcher'
    ResearcherId = db.Column(db.Integer, primary_key=True)
    Username = db.Column(db.String)
    Password = db.Column(db.Binary)

    def get_id(self):
        return str(self.ResearcherId)

@login.user_loader
def load_user(id):
    return Researcher.query.get(int(id))
