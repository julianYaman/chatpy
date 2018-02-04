from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('index.html', title="Chat application")


if __name__ == '__main__':
    app.run()
