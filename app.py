from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='.')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

app.run(port=8000)
