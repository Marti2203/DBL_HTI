#import datetime
import pandas as pd
from flask import Flask, render_template, request, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Binary
from ..models.Upload import Upload
from ..models.Researcher import Researcher
from ..appcreator import Appcreator
import bcrypt
import base64


class DatabaseInsert:
    def __init__(self):
        self.creatorobject = Appcreator()
        self.app = self.creatorobject.create_app()
        self.db = self.creatorobject.db
        self.engine = create_engine(
            'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb')
        self.meta = MetaData()
        
    def insertStimuli(self, file):
        insert = self.StimuliTable.insert().values(Stimuli=file)
        conn = self.engine.connect()
        conn.execute(insert)

    def insertCSV(self, df_csv):
        df_csv.to_sql(self.FileName, self.engine)

    """
        * The register method checks if the username is taken, if not then it will create the user.
        * This method returns true if it has made a new user and false if the user already exists.
        * The given password needs to be encoded to base64 because the hashpw function works with
        * encoded data instead of strings. The hashedpw is the hashed version of the encoded password
        * combined with a salt, a salt makes it so that two identical passwords are something different in
        * the hashed form. The hashedpw gets stored in a column with datatype bytea.
        * We use Bcrypt for hashing, which is based on the blowfish encryption algorithm.
        !!! In the database you should change the Researcher.Password column's datatype from text to bytea. !!!
    """
    def register(self, givenusername, plaintxtpassword):
        user_exists = self.db.session.query(self.db.exists().where(Researcher.Username==givenusername)).scalar()
        if user_exists:
            return False
        else:
            encodedpw = base64.urlsafe_b64encode(plaintxtpassword.encode("utf-8"))
            hashedpw = bcrypt.hashpw(encodedpw, bcrypt.gensalt())
            new_researcher = Researcher(Username=givenusername, Password=hashedpw)
            self.db.session.add(new_researcher)
            self.db.session.commit()
            return True

    """
        * The login function is supposed to get the password data from the database,
        * then verify the given password. This basically gets done by hashing the given
        * password and then checking to see if they are similar. The only diference should be the
        * random salt. First we query for the password data, this returns an array. The hashedpw
        * is the first element of the array. Then we need to encode the given password so we can use it
        * in the checkpw funciton. (checkpw uses hashpw and therefore the input should be encoded.)
        * The function then returns true if the passwords match.
    """
    def login(self, givenusername, givenpassword):
        res = self.db.session.query(Researcher.Password).filter(Researcher.Username==givenusername).first()
        hashedpw = res[0]
        encodedpw = base64.urlsafe_b64encode(givenpassword.encode("utf-8"))
        if bcrypt.checkpw(encodedpw, hashedpw):
            return True
        else:
            return False
