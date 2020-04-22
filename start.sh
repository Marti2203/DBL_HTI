#!/bin/sh
export FLASK_APP=app.py
if [ "$1" == "debug" ];
then export FLASK_ENV=development
fi
flask run
