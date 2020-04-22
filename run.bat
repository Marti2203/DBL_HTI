set CURRENTFOLDER=%CD%
set ANACONDA="C:\ProgramData\Anaconda3"
call %ANACONDA%\Scripts\activate.bat  %ANACONDA%
cd %CURRENTFOLDER%
set FLASK_APP=app.py
flask run
