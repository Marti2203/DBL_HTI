#import datetime
import pandas as pd
from flask import Flask, render_template, request, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from .models.Stimuli import Stimuli
from .models.File import File
from .models.Filename import Filename
from .models.Upload import Upload
from .appcreator import Appcreator


class DatabaseInsert:
    def __init__(self):
        self.creatorobject = Appcreator()
        self.app = self.creatorobject.create_app()
        self.db = self.creatorobject.return_db()
        return

    """
        * In the main function the whole process will be implemented. Here we should make the index query,
        * The reading of the csv and the updating of Upload and Filename tables with new entries.
    """

    def main(self):
        index = "0" # This number will be made dynamic, then you will need to query the last row of the Filename table
        FileName = "File"+index
        StimuliName = "Stimuli"+index
        self.prepare_database(FileName, StimuliName)
        #df_data = pd.read_csv('temporary/csv/fixed_csv.csv', encoding='latin1', sep='\t')
        #for row in
        self.FilenameUpdater(FileName, index) # Adds the new entry in the Filename table
        self.UploadUpdater(FileName, StimuliName)

    """
        * This function takes the FileName and StimuliName parameters and makes tables with those names.
    """
    def prepare_database(self, FileName, StimuliName):
        # Creates tables for the file with name File, same with Stimuli.
        engine = create_engine('postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb', echo = True)
        meta = MetaData()

        FileTable = Table(
            FileName, meta,
            Column('Index', Integer, primary_key=True),
            Column('Timestamp', Integer),
            Column('StimuliName',String),
            Column('FixationIndex', Integer),
            Column('FixationDuration', Integer),
            Column('MappedFixationPointX', Integer),
            Column('MappedFixationPointY', Integer),
            Column('user', String),
            Column('description', String)
        )

        StimuliTable = Table(
            StimuliName, meta,
            Column('Index', Integer, primary_key=True),
            Column('Stimuli', String),
        )

        meta.create_all(engine)

    """
        * I hope to implement this function such that when it is called there is a
        * row added to Filename with the right data.
    """
    def FilenameUpdater(self, FileName, Index):
        # Creates a new row in the Filename table
        newEntry = Filename(ID=Index, File=FileName)
        self.db.session.add(newEntry)
        self.db.session.commit()

    """
        * Here comes the function where a row is added to Upload with the right data.
        * This will probably look similar to FilenameUpdater, but that doesn't work yet.
    """
    def UploadUpdater(self, FileName, StimuliName):
        # Creates a new row in the Upload tables
        newEntry = Upload(Size=0, File=FileName, Stimuli=StimuliName, Datetime="now")
        self.db.session.add(newEntry)
        self.db.session.commit()
        return
