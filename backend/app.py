from flask import Flask, jsonify, Response, request, stream_with_context
from flask_cors import CORS
import time
import sys
import re
import ollama


app = Flask(__name__)
CORS(app, origins=["http://localhost:5000"], supports_credentials=True)

@app.route("/explain", methods=['POST'])
def explain():
    data = request.json
    code_snippet = data.get('code', '')
    response = ollama.chat(
        model = "codellama:13b",
        messages=[
            {"role": "system", "content": "You are a code explainer. Your job is to explain the code's function in simple points"},
            {"role": "user", "content": f"Explain this code: {code_snippet} shortly"}
        ]
    )
    explanation = response['message']['content']
    return jsonify({'explanation': explanation})

if __name__ == '__main__':
    app.run(debug=True)