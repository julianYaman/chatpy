from flask import Flask, request, jsonify, render_template, session
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from colorama import init, Fore, Back, Style

app = Flask(__name__)
app.debug = False
app.secret_key = "secret!"
socketio = SocketIO(app)

init(autoreset=True)

VERSION = "v1.0"


@app.route('/')
def home():
    return render_template('index.html', title="ChatPY " + VERSION)


# Connect event
@socketio.on('connect', namespace='/handler')
def test_connect():
    print(Back.GREEN + Fore.BLACK + 'Client connected -> ', request.sid)
    # Message to the client when connection was successfully made
    emit('message_by_server', {'data': "Socket works! You are connected!"})
    print(socketio)


# If the socket thread from the client sent a message to the
# server backend resulting into printing out a message in the console
@socketio.on('client_message', namespace='/handler')
def handle_client_message(message):
    print(Back.BLUE + "Message by client " + request.sid + ": " + message['data'])


# Disconnect event
@socketio.on('disconnect', namespace='/handler')
def test_connect():
    # Leaving the room
    leave_room(session.r)
    print(Fore.RED + "Client " + request.sid + " with the username '" + session.u + "' is disconnected " +
          "from the room " + session.r)

    # Emitting the message to the room that the user is disconnected.
    emit('chat_information', session.r + ' disconnected.', room=session.r)
    print(Back.RED + 'Client disconnected -> ', request.sid)


# Join Room event
@socketio.on('join', namespace='/handler')
def on_join(data):
    print(data['username'], data['room'])

    print(session)
    session.u = data['username']
    session.r = data['room']
    print(session.u, session.r)

    join_room(data['room'])
    print(Fore.GREEN + "Client " + request.sid + " with the username '" + data['username'] + "' entered channel room " +
          data['room'])
    emit('chat_information', data['username'] + ' has entered the chat room.', room=data['room'])


# Leave Room event
@socketio.on('leave', namespace='/handler')
def on_leave():
    leave_room(session.r)
    print(Fore.RED + "Client " + request.sid + " with the username '" + session.u + "' " +
          "left channel room " + session.r)

    # Emitting the message to the room that the user left the room
    emit('chat_information', session.u + ' has left the room.', room=session.r)


# Event when a message was sent to the server, emitting the message to the users in the same room
@socketio.on('sendChat_message', namespace='/handler')
def chat_message(data):
    emit('chat_message', {'username': session.u, 'content': data['message']}, room=session.r)


if __name__ == '__main__':
    print(Fore.MAGENTA + "Trying to run the application... (if it is not, you will see an error)")
    socketio.run(app)
