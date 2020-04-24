from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('helloworld.html')
@app.route('/math')
def math():
    return str(2**1000)
    
@app.route('/goodmath')
def goodmath():
    return "Please add /'base' to the end of the url."

@app.route('/goodmath/<int:base>')
def good_math(base):
    return str(base**1000)
