'''
Takes the zipfile uploaded and sends files to the right folder based on filetype.
Csv's will be sent to the csv-folder in static, and images to the stimuli-folder in static.
After the files are sorted, the origin zip and 'helper'-folder are deleted, ready for the
next zip-file uploaded.
'''
import zipfile
import shutil, os
import pandas as pd

#sorts files in uploaded_zip.zip
def sort_zip():
    file_list = [] #list with all filenames of the zip
    with zipfile.ZipFile('uploaded_zip.zip', 'r') as uploaded_zip:
        uploaded_zip.extractall('static/uploaded_files') #extract all files in zip to folder uploaded_files
        file_list = uploaded_zip.namelist() #list of all files in zip
        for file in file_list:
            #send all images to stimuli-folder and csv to csv-folder, all other files are left as is
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                shutil.move('static/uploaded_files/'+file, 'static/stimuli')
            #elif file.lower().endswith(('.csv')):
            #    read_csv(file) #transforms csv
            #    shutil.move('static/uploaded_files/'+file, 'static/csv')
        shutil.rmtree('static/uploaded_files') #deletes 'helper'-folder
    os.remove('uploaded_zip.zip') #shutil doesnt work to delete, so here we use os instead to delete the uploaded zip in the end

#transforms/reformats uploaded csv
def read_csv(file):
    #encoding = latin1 necessary to read, separator \t for dataset separated by tab instead of comma, when reading to list
    #known non-ascii characters are replaced by ascii and merged with actual name
    df_data = pd.read_csv('static/uploaded_files/'+file, encoding='latin1', sep='\t') 
    df_data['StimuliName'] = df_data['StimuliName'].str.replace('\u00c3\u00bc', 'ü').str.replace('\u00c3\u00b6', 'ö')
    #df_data.to_csv(r'static/csv/fixed_csv.csv') #to save dataframe to correct folder
    #however it might be smarter to insert directly into the database here.
    #print(df_data[df_data['Timestamp']==8176])
    return df_data #returns transformed dataframe