from flask import Flask, render_template, request, jsonify
import data_processing
import os
import json
app = Flask(__name__, static_folder="static")

visualizations = [
    {'name': 'Visualization 1', 'link': 'vis1'},
    #{'name': 'Visualization 2', 'link': 'vis2'},
]

@app.route('/')
def main():
    return render_template('helloworld.html',
                           visualizations=visualizations)

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/stimuliNames')
def stimuliNames():
    files = os.listdir('./static/stimuli')
    res = json.dumps(files)
    return res
