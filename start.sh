#!/bin/bash
export FLASK_APP=app.py

if [[ "$1" == "debug" ]];
then export FLASK_ENV=development
fi

if [[ "$1" == "prod" ]];
then 
	flask run --host=0.0.0.0 --port=80
else 
	flask run
fi
