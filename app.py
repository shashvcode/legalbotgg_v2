from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from helpers import embed, context, chat
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='frontend/dist', template_folder='frontend/dist')
CORS(app, resources={
    r"/legalchat": {
        "origins": ["http://localhost:5173", "http://localhost:5174"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route("/")
def index():
    return send_from_directory('frontend/dist', 'index.html')

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory('frontend/dist', path)

@app.route("/legalchat", methods=["POST"])
def legal_chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        query = data.get("query")
        if not query:
            return jsonify({"error": "Query is required"}), 400

        embedded = embed(query)
        legal_context = context(embedded, top_k=5)
        answer = chat(query, legal_context)

        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)