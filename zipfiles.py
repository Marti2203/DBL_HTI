'''
Takes the zipfile uploaded and sends files to the right folder based on filetype.
Some changes are still needed here when the frontend for the upload is made so
that we can avoid unnecessary folders and keep the structure neat, this is a 
quick fix so I'll simply fix that after finding a smart way to take in the zip-file
in a stratetic destination
'''
import zipfile
import shutil

file_list = []
with zipfile.ZipFile('uploaded_zip.zip', 'r') as uploaded_zip:
    uploaded_zip.extractall('uploaded_files') #extract all files in zip to folder uploaded_files
    file_list = uploaded_zip.namelist() #list of all files in zip
    for file in file_list:
        #send all images to stimuli-folder and csv to csv-folder, all other files are left as is
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            shutil.move(file, './static/stimuli')
        elif file.lower().endswith(('.csv')):
            shutil.move(file, './static/csv')
