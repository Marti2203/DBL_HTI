from flask import Flask, render_template, request
app = Flask(__name__, static_folder="static")

visualizations = [
    {'name': 'Visualization 1', 'link': 'vis1'},
    {'name': 'Visualization 2', 'link': 'vis2'},
]
@app.route('/login', methods=["POST"])
def login():
    return "1"

@app.route('/')
def main():
    return render_template('helloworld.html',
                           visualizations=visualizations)

@app.route('/upload')
def upload():
    return render_template('upload.html')


@app.route('/vis1')
def vis1():
    return render_template('vis1.html')
