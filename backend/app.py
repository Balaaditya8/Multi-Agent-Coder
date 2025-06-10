from flask import Flask, jsonify, Response, request, stream_with_context
from flask_cors import CORS
import time
import sys
import re


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == '__main__':
    app.run(debug=True)