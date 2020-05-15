import zipfile
import shutil, os
import pandas as pd
import time
from .insert import *

'''
    Function that sorts files in uploaded_zip.zip by first extracting to a subfolder of 'temporary', then going through
    all files and sending them to the right folder in temporary based on filetype (.jpg, .jpeg, .png to stimuli).
    After this file-sorting, read-csv is called for fixing the csv and sending that where it should. Lastly the 'helper'-folder
    is deleted along with the actual zip-file uploaded so it's ready to receive the next upload. All files in zip that aren't
    images or csv's are ignored and deleted.
'''
def sort_zip():
    file_list = [] #list with all filenames of the zip
    with zipfile.ZipFile('uploaded_zip.zip', 'r') as uploaded_zip:
        uploaded_zip.extractall('temporary/uploaded_files') #extract all files in zip to folder uploaded_files
        try:
            os.mkdir('temporary/csv')
            os.mkdir('temporary/stimuli')
        except:
            print('Directories already exist, continueing')

        file_list = uploaded_zip.namelist() #list of all files in zip
        newInsert = DatabaseInsert()
        newInsert.main()
        for file in file_list:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                shutil.move('temporary/uploaded_files/'+file, 'temporary/stimuli')
            elif file.lower().endswith(('.csv')):
                df_csv = read_csv(file) #transforms csv and sends to right place
                newInsert.insertCSV(df_csv)
                #shutil.move('temporary/uploaded_files/'+file, 'temporary/csv') #to send originally uploaded csv to csv-folder
        shutil.rmtree('temporary/uploaded_files') #deletes 'helper'-folder
    os.remove('uploaded_zip.zip') #shutil doesnt work to delete, so here we use os instead to delete the uploaded zip in the end
    for item in os.listdir('temporary/stimuli'):
        with open('temporary/stimuli/'+item, 'rb') as f:
        #f = open(item, 'rb')
            blob = f.read()
            newInsert.insertStimuli(blob)
    restore_temp()
'''
    Transforms/reformats uploaded csv. Encoding = latin1 necessary to read, separator \t for dataset separated by tab instead
    of comma, when fixing dataframe known problematic non-ascii characters are replaced by ascii. After fixing csv, it is saved
    to new csv in utf-16 to avoid further umlaut-issues (in correct folder in temporary). This function is also a place
    we could potentially insert rows directly into database if needed.
'''
def read_csv(file):
    df_data = pd.read_csv('temporary/uploaded_files/'+file, encoding='latin1', sep='\t')
    df_data['StimuliName'] = df_data['StimuliName'].str.replace('\u00c3\u00bc', 'ü').str.replace('\u00c3\u00b6', 'ö')
    df_data.to_csv(r'temporary/csv/fixed_csv.csv', encoding='utf-16', index=False) #to save dataframe to correct folder (NEEDS TO BE UTF-16)
    #print(df_data[df_data['Timestamp']==8176]) #check if dataframe is fixed (known problematic values with this timestamp)
    return df_data #returns transformed dataframe


'''
    Function to empty csv and stimuli-folder from storage to prepare for next upload after we are sure everything is
    properely read into the database.
'''
def restore_temp():
    shutil.rmtree('temporary/csv')
    shutil.rmtree('temporary/stimuli')
    os.mkdir('temporary/csv')
    os.mkdir('temporary/stimuli')
