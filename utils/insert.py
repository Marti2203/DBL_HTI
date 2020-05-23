#import datetime
import pandas as pd
from flask import Flask, render_template, request, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Binary
from ..models.Upload import Upload
from ..appcreator import Appcreator


class DatabaseInsert:
    def __init__(self):
        self.creatorobject = Appcreator()
        self.app = self.creatorobject.create_app()
        self.db = self.creatorobject.db
        self.engine = create_engine(
            'postgresql://postgres:75fb03b2e5@localhost/DBL_HTIdb')
        self.meta = MetaData()
    def insertStimuli(self, file):
        # class tempStimuli(self.db.Model):
        #    __tablename__ = self.StimuliName
        #    Index = self.db.Column(self.db.Integer, primary_key=True)
        #    Stimuli = self.db.Column(self.db.Binary)

        #newStimulus = Stimuli(__tablename__=self.StimuliName, Stimuli=file)
        # self.db.session.add(newStimulus)
        # self.db.session.commit()
        insert = self.StimuliTable.insert().values(Stimuli=file)
        conn = self.engine.connect()
        conn.execute(insert)

    def insertCSV(self, df_csv):
        df_csv.to_sql(self.FileName, self.engine)
