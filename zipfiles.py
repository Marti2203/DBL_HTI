'''
Takes the zipfile uploaded and sends files to the right folder based on filetype.
Csv's will be sent to the csv-folder in static, and images to the stimuli-folder in static.
After the files are sorted, the origin zip and 'helper'-folder are deleted, ready for the
next zip-file uploaded.
'''
import zipfile
import shutil, os

def sort_zip():
    file_list = [] #list with all filenames of the zip
    with zipfile.ZipFile('uploaded_zip.zip', 'r') as uploaded_zip:
        uploaded_zip.extractall('static/uploaded_files') #extract all files in zip to folder uploaded_files
        file_list = uploaded_zip.namelist() #list of all files in zip
        for file in file_list:
            #send all images to stimuli-folder and csv to csv-folder, all other files are left as is
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                shutil.move('static/uploaded_files/'+file, 'static/stimuli')
            elif file.lower().endswith(('.csv')):
                shutil.move('static/uploaded_files/'+file, 'static/csv')
        shutil.rmtree('static/uploaded_files') #deletes 'helper'-folder
    os.remove('uploaded_zip.zip') #shutil doesnt work to delete, so here we use os instead to delete the uploaded zip in the end
