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
        index = str(self.QueryLastIndex() + 1) # Takes the last ID from Filename and adds 1
        FileName = "File"+index
        StimuliName = "Stimuli"+index
        self.prepare_database(FileName, StimuliName) # Creates the new File and Stimuli tables
        self.FilenameUpdater(FileName, index) # Adds the new entry in the Filename table
        self.UploadUpdater(FileName, StimuliName) # Adds the new entry in the Upload table

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
        * This function takes the filename and index and adds an entry to the Filename
        * table
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
        # We give an arbitraty size 0, the filename, the stimuliname
        # and the current Datetime, this gets interpreted by the database.
        newEntry = Upload(Size=0, File=FileName, Stimuli=StimuliName, Datetime="now")
        self.db.session.add(newEntry)
        self.db.session.commit()
        return

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
