from flask import Flask, render_template, request
app = Flask(__name__, static_folder="static")

@app.route('/')
def main():
    return render_template('helloworld.html')

