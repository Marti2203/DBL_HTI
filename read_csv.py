import pandas as pd
import numpy as np
from flask import Flask
from flask import Flask, render_template, request
from werkzeug import secure_filename

app = Flask(__name__)

@app.route('/upload_file')
def upload_file1():
   return render_template('upload_html.html')
	
@app.route('/file_uploaded', methods = ['GET', 'POST'])
def file_received():
   if request.method == 'POST':
      f = request.files['file']
      f.save(secure_filename(f.filename))
      print(f.filename)

      def reading_csv(file):
         #encoding = latin1 necessary to read, separator \t for dataset separated by tab instead of comma, when reading to list
         #known non-ascii characters are replaced by ascii and merged with actual name
         df_data = pd.read_csv(file, encoding='latin1', sep='\t') 
         stimulis = [x.replace('\u00c3\u00bc', 'ü').replace('\u00c3\u00b6', 'ö') for x in df_data['StimuliName'].unique()]
         stimulis = np.unique(stimulis) #filter out non-unique stimuli-names
         dataframes = [df_data[df_data['StimuliName'] == stimuli] for stimuli in stimulis] #add dataframes by stimuliname
         return stimulis
      stimulis = reading_csv(f.filename)
      if request.method == 'GET':
         select = request.form.get('comp_select')
         print(type(select))
      return render_template('dropdown.html', stimulis=stimulis)

@app.route('/table')
def make_table():
   return render_template('display_table.html')