from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return '''<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<title>Base page</title>
<h1>Hi!</h1>
<p>This is a very basic front end</p>
<div id="app">
  {{ message }}
</div>
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<script>
"use strict";
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue from our DBL project!'
  }
});
setTimeout(function (){ app.message="2 seconds passed"; console.log("2 seconds")},3000);
</script>
'''
@app.route('/math')
def math():
    return str(2**1000)
    
@app.route('/goodmath')
def goodmath():
    return "Please add /'base' to the end of the url."

@app.route('/goodmath/<int:base>')
def good_math(base):
    return str(base**1000)
