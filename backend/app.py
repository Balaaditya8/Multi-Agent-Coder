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


@app.route("/refine", methods=['POST'])
def refine():
    data = request.json
    code_snippet = data.get('code', '')
    mode = data.get('mode', '').lower()

    if not code_snippet or not mode:
        return jsonify({'error': 'Missing code or mode'}), 400

    # Choose system prompt based on refinement mode
    if mode == 'simplify':
        system_prompt = (
            "You are a code simplifier. Your job is to make technical code explanations "
            "more beginner-friendly. Use short sentences and break down complex logic in simple terms. "
            "Use bullet points."
        )
        user_prompt = f"Simplify and explain the following code for a beginner:\n\n{code_snippet}"

    elif mode == 'optimize':
        system_prompt = (
            "You are a code optimizer. Your job is to identify inefficiencies or bad practices in code "
            "and suggest improvements. Focus on performance, readability, and modern best practices."
        )
        user_prompt = f"Suggest ways to optimize and improve the following code:\n\n{code_snippet}"

    elif mode == 'debug':
        system_prompt = (
            "You are a code debugger. Your job is to identify potential bugs, logical errors, or risky edge cases "
            "in the given code and explain how to fix them."
        )
        user_prompt = f"Find bugs or risky patterns in the following code and suggest fixes:\n\n{code_snippet}"

    else:
        return jsonify({'error': 'Unsupported refinement mode'}), 400

    # Call LLM with selected prompt
    response = ollama.chat(
        model="codellama:13b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    explanation = response['message']['content']
    return jsonify({'explanation': explanation})



if __name__ == '__main__':
    app.run(debug=True)