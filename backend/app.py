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
        messages = [
    {
        "role": "system",
        "content": (
            "You are a code explainer. Your job is to read a code snippet "
            "and explain what it does **overall** in a **short and simple** way. "
            "Use **bullet points**. Avoid line-by-line explanations unless the code is very short. "
            "Focus on purpose, logic, and any important behavior."
        )
    },
    {
        "role": "user",
        "content": f"Explain what the following code does:\n\n{code_snippet}"
    }
]
    )
    explanation = response['message']['content']
    return jsonify({'explanation': explanation})

if __name__ == '__main__':
    app.run(debug=True)