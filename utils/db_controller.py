#import datetime
import pandas as pd
from flask import Flask, render_template, request, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Binary
import bcrypt
import base64
from datetime import date
from flask_login import current_user


class DatabaseController:
    def __init__(self,db,app,modelsdict):
        self.app = app
        self.db = db
        self.models = modelsdict
        self.engine = create_engine(
            self.app.config['SQLALCHEMY_DATABASE_URI'])
        self.meta = MetaData()

    def insertCSV(self, df, stimuli, file_name,dataset_name):
        researcher = current_user
        upload = None
        stimuliObjects = []

        try:
            upload = self.models['Upload'](
                Created=date.today(), FileName=file_name,DatasetName=dataset_name, Stimuli=stimuli)
            researcher.Uploads.append(upload)
            self.db.session.add(upload)
            self.db.session.add(researcher)
            self.db.session.commit()

            df.loc[:, 'UploadID'] = upload.ID
            for stimulus in stimuli:
                mask = df['StimuliName'] == stimulus
                participants = df[mask]['user'].unique().tolist()
                stimuli_data = self.models['StimuliData'](StimuliName=stimulus,
                                                          UploadID=upload.ID, Participants=participants)
                stimuliObjects.append(stimuli_data)
                self.db.session.add(stimuli_data)
            self.db.session.commit()
            df.to_sql('UploadRow', self.engine, method='multi',
                          if_exists='append', index=False, index_label='ID')
            return True
        except Exception as e:
            print(e)
            if len(stimuli) != 0:
                for stimulus in stimuliObjects:
                    db.session.delete(stimulus)
            if upload is not None:
                db.session.delete(upload)
            db.session.commit()
            raise e

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
        user_exists = self.db.session.query(self.db.exists().where(
            self.models['Researcher'].Username == givenusername)).scalar()
        if user_exists:
            return False
        else:
            encodedpw = base64.urlsafe_b64encode(
                plaintxtpassword.encode("utf-8"))
            hashedpw = bcrypt.hashpw(encodedpw, bcrypt.gensalt())
            new_researcher = self.models['Researcher'](
                Username=givenusername, Password=hashedpw)
            self.db.session.add(new_researcher)
            self.db.session.commit()
            return True

    """
        * The login function is supposed to get the password data from the database,
        * then verify the given password. This basically gets done by hashing the given
        * password and then checking to see if they are similar. The only diference should be the
        * random salt. We get the user object from the route, hence we don't have to query for the password
        * in here. Then we need to encode the password given by the user so we can use it
        * in the checkpw funciton. (checkpw uses hashpw and therefore the input should be encoded.)
        * The function then returns true if the passwords match.
    """

    def login(self, user, givenpassword):
        encodedpw = base64.urlsafe_b64encode(givenpassword.encode("utf-8"))
        if bcrypt.checkpw(encodedpw, user.Password):
            return True
        else:
            return False
