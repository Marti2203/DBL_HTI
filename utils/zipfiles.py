import zipfile
import shutil
import os
import pandas as pd
import time
from .insert import *
import tempfile
'''
    Function that sorts files in uploaded_zip.zip by first extracting to a subfolder of 'temporary', then going through
    all files and sending them to the right folder in temporary based on filetype (.jpg, .jpeg, .png to stimuli).
    After this file-sorting, read-csv is called for fixing the csv and sending that where it should. All of this is created
    in a directory given in the function as it is not known whether the files are need to be kept. In app.py we just delete the folder.
'''


def sort_zip(directory_path, zip_name):
    file_list = []  # list with all filenames of the zip
    with zipfile.ZipFile(os.path.join(directory_path,zip_name), 'r') as uploaded_zip:
        # extract all files in zip to folder uploaded_files
        extract_path = os.path.join(directory_path, 'uploaded_files')
        stimuli_path = os.path.join(directory_path, 'stimuli')
        csv_path = os.path.join(directory_path, 'csv')

        uploaded_zip.extractall(extract_path)
        os.mkdir(csv_path)
        os.mkdir(stimuli_path)

        file_list = uploaded_zip.namelist()  # list of all files in zip
        newInsert = DatabaseInsert()
        newInsert.initialize()
        for file in file_list:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                shutil.move(os.path.join(extract_path, file), stimuli_path)
            elif file.lower().endswith(('.csv')):
                # transforms csv and sends to right place
                df_csv = read_csv(csv_path, extract_path, file)
                newInsert.insertCSV(df_csv)
                # shutil.move('temporary/uploaded_files/'+file, 'temporary/csv') #to send originally uploaded csv to csv-folder
    for item in os.listdir(stimuli_path):
        with open(os.path.join(stimuli_path, item), 'rb') as f:
            #f = open(item, 'rb')
            blob = f.read()
            newInsert.insertStimuli(blob)


'''
    Transforms/reformats uploaded csv. Encoding = latin1 necessary to read, separator \t for dataset separated by tab instead
    of comma, when fixing dataframe known problematic non-ascii characters are replaced by ascii. After fixing csv, it is saved
    to new csv in utf-16 to avoid further umlaut-issues (in correct folder in temporary). This function is also a place
    we could potentially insert rows directly into database if needed.
'''


def read_csv(csv_path, extract_path, file):
    df_data = pd.read_csv(os.path.join(extract_path, file),
                          encoding='latin1', sep='\t')
    df_data['StimuliName'] = df_data['StimuliName'].str.replace(
        '\u00c3\u00bc', 'ü').str.replace('\u00c3\u00b6', 'ö')
    # to save dataframe to correct folder (NEEDS TO BE UTF-16)
    df_data.to_csv(os.path.join(csv_path, 'fixed_csv.csv'),
                   encoding='utf-16', index=False)
    # print(df_data[df_data['Timestamp']==8176]) #check if dataframe is fixed (known problematic values with this timestamp)
    return df_data  # returns transformed dataframe
