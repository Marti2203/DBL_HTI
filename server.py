from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return '''<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<title>Base page</title>
<h1>Hi!</h1>
<p>This is a very basic front end</p>
<script> alert('Hello there!')</script>
'''
@app.route('/math')
def math():
    return str(2**1000)

@app.route('/goodmath/<int:base>')
def good_math(base):
    return str(base**1000)
