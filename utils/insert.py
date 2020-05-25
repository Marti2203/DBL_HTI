#import datetime
import pandas as pd
from flask import Flask, render_template, request, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Binary
from ..models.Stimuli import Stimuli
from ..models.File import File
from ..models.Filename import Filename
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
        self.index = ''
        self.FileName = ''
        self.StimuliName = ''
        self.engine = create_engine(
            'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb')
        self.meta = MetaData()

    """
        * In the main function the whole process will be implemented. Here we should make the index query,
        * The reading of the csv and the updating of Upload and Filename tables with new entries.
    """

    def initialize(self):
        # Takes the last ID from Filename and adds 1
        self.index = str(self.QueryLastIndex() + 1)
        self.FileName = "File"+self.index
        self.StimuliName = "Stimuli"+self.index
        self.prepare_database()  # Creates the new File and Stimuli tables
        self.FilenameUpdater()  # Adds the new entry in the Filename table
        self.UploadUpdater()  # Adds the new entry in the Upload table

    """
        * This function takes the FileName and StimuliName parameters and makes tables with those names.
    """

    def prepare_database(self):
        # Creates tables for the file with name File, same with Stimuli.

        self.StimuliTable = Table(
            self.StimuliName, self.meta,
            Column('Index', Integer, primary_key=True),
            # use Binary as datatype when you want actual images
            Column('Stimuli', Binary),
            extend_existing=True,
        )

        self.meta.create_all(self.engine)

    """
        * This function takes the filename and index and adds an entry to the Filename
        * table
    """

    def FilenameUpdater(self):
        # Creates a new row in the Filename table
        newEntry = Filename(ID=self.index, File=self.FileName)
        self.db.session.add(newEntry)
        self.db.session.commit()

    """
        * Here comes the function where a row is added to Upload with the right data.
        * This will probably look similar to FilenameUpdater, but that doesn't work yet.
    """

    def UploadUpdater(self):
        # Creates a new row in the Upload tables
        # We give an arbitraty size 0, the filename, the stimuliname
        # and the current Datetime, this gets interpreted by the database.
        newEntry = Upload(Size=0, File=self.FileName,
                          Stimuli=self.StimuliName, Datetime="now")
        self.db.session.add(newEntry)
        self.db.session.commit()

    """
        * This function orders the Filename table in descending order and then gets the first result
        * The returned ID is the last row of the ID column.
    """

    def QueryLastIndex(self):
        result = self.db.session.query(Filename).order_by(Filename.ID.desc()).first()
        if result is not None:
            return result.ID
        else:
            return -1

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
