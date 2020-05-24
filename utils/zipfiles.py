import zipfile
import shutil
import os
import pandas as pd
import time
from .insert import *
import tempfile

'''
    Function that processes files in uploaded_zip.zip by first extracting to a path given by the caller, then going through
    all files and sending them to the right folder based on filetype (.jpg, .jpeg, .png for stimuli).
    After this file-sorting, read-csv is called for fixing the csv and sending that where it should. All of this is created
    in a directory given in the function as it is not known whether the files are need to be kept. In app.py we just delete the folder.
'''


def process_zip(appstate,researcher_id, directory_path, zip_name):
    stimuli, csv_name = extract_zip(directory_path, zip_name)
    newInsert = DatabaseInsert(appstate)
    df_csv = read_csv(os.path.join(directory_path, 'csv'), csv_name)
    newInsert.insertCSV(df_csv,stimuli,csv_name,researcher_id)


def extract_zip(directory_path, zip_name):
    stimuli = []
    csv_name = None
    with zipfile.ZipFile(os.path.join(directory_path, zip_name), 'r') as uploaded_zip:
        # extract all files in zip to folder uploaded_files
        extract_path = os.path.join(directory_path, 'uploaded_files')
        stimuli_path = os.path.join(directory_path, 'stimuli')
        csv_path = os.path.join(directory_path, 'csv')

        uploaded_zip.extractall(extract_path)
        os.mkdir(csv_path)
        os.mkdir(stimuli_path)

        file_list = uploaded_zip.namelist()  # list of all files in zip
        for file in file_list:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                shutil.move(os.path.join(extract_path, file), stimuli_path)
                stimuli.append(file)
            elif file.lower().endswith(('.csv')):
                shutil.move(os.path.join(extract_path, file), csv_path)
                csv_name = file

        # remove any files which are shipped with the zip but not required
        os.rmdir(extract_path)
    return stimuli, csv_name


'''
    Transforms/reformats uploaded csv. Encoding = latin1 necessary to read, separator \t for dataset separated by tab instead
    of comma, when fixing dataframe known problematic non-ascii characters are replaced by ascii. After fixing csv, it is saved
    to new csv in utf-16 to avoid further umlaut-issues (in correct folder in temporary). This function is also a place
    we could potentially insert rows directly into database if needed.
'''


def read_csv(path, file):
    df_data = pd.read_csv(os.path.join(path, file),
                          encoding='latin1', sep='\t')
    df_data['StimuliName'] = df_data['StimuliName'].str.replace(
        '\u00c3\u00bc', 'ü').str.replace('\u00c3\u00b6', 'ö')
    # to save dataframe to correct folder (NEEDS TO BE UTF-16)
    df_data.to_csv(os.path.join(path, 'fixed_csv.csv'),
                   encoding='utf-16', index=False)
    # print(df_data[df_data['Timestamp']==8176]) #check if dataframe is fixed (known problematic values with this timestamp)
    return df_data  # returns transformed dataframe
