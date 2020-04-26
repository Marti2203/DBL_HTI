from flask import Flask, render_template, request
app = Flask(__name__, static_folder="static")

@app.route('/')
def main():
    return render_template('helloworld.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/vis1')
def vis1():
    return render_template('vis1.html')

@app.route('/vis2')
def vis2():
    return render_template('vis2.html')

@app.route('/vis3')
def vis3():
    return render_template('vis3.html')

@app.route('/vis4')
def vis4():
    return render_template('vis4.html')

