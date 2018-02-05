from flask import Flask, request, jsonify, render_template, session
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from colorama import init, Fore, Back, Style

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = "secret!"
socketio = SocketIO(app)

init(autoreset=True)

VERSION = "v0.0.1"


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
    leave_room(session['room'])
    print(Fore.RED + "Client " + request.sid + " with the username '" + session['username'] + "' is disconnected " +
          "from the room" + session['room'])

    # Emitting the message to the room that the user is disconneted.
    emit('chat_information', session['username'] + ' disconnected.', room=session['room'])
    print(Back.RED + 'Client disconnected -> ', request.sid)


# Join Room event
@socketio.on('join', namespace='/handler')
def on_join(data):
    username = data['username']
    room = data['room']

    session['username'] = username
    session['room'] = room

    join_room(room)
    print(Fore.GREEN + "Client " + request.sid + " with the username '" + username + "' entered channel room " + room)
    emit('chat_information', username + ' has entered the chat room.', room=room)


# Leave Room event
@socketio.on('leave', namespace='/handler')
def on_leave():
    leave_room(session['room'])
    print(Fore.RED + "Client " + request.sid + " with the username '" + session['username'] + "' " +
          "left channel room " + session['room'])

    # Emitting the message to the room that the user left the room
    emit('chat_information', session['username'] + ' has left the room.', room=session['room'])


# Event when a message was sent to the server, emitting the message to the users in the same room
@socketio.on('sendChat_message', namespace='/handler')
def chat_message(data):
    emit('chat_message', {'username': session['username'], 'content': data['message']}, room=session['room'])


if __name__ == '__main__':
    print(Fore.MAGENTA + "Trying to run the application... (if it is not, you will see an error)")
    socketio.run(app)
