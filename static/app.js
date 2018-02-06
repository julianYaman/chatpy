var log = console.log;

document.addEventListener("DOMContentLoaded", function () {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/handler');

    // "Connect" socket event
    socket.on('connect', function(client) {
        // Emitting a message to the server that the client is connected.
        socket.emit("client_message", {data: 'I´m connected with the server!'});
    });

    socket.on('message_by_server', function (message) {
        console.log(currentDate(new Date()) + " Message from the server: " + message.data);
    });

    var loginForm = document.getElementById("loginForm");

    if(loginForm.addEventListener){
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var username = document.getElementById("usernameField").value;
            var room = document.getElementById("roomField").value;

            log({username: username, room: room});

            socket.emit("client_message", {data: 'I have some data for you! User ' + username + " wants to join room " + room + " !"});
            socket.emit("join", {username: username, room: room});

            // Hiding Login form element
            loginForm.style.display = 'none';

            // Showing Chat Container
            document.getElementsByClassName("chatContainer")[0].style.display = 'block';

            // Changing Headline
            document.getElementsByClassName("justAHeadline")[0].innerHTML = "<b>Chat ️💬</b>";

            // Displaying Chat Information container and "Leave Room" button
            document.getElementsByClassName("chatInformationContainer")[0].style.display = 'block';
            document.getElementsByClassName("chatLeaveRoomButtonContainer")[0].style.display = 'block';

            // Displaying information about the room and chat
            document.getElementsByClassName("chatInfo_room")[0].innerHTML = "Room: <b>" + room + "</b>";
            document.getElementsByClassName("chatInfo_username")[0].innerHTML = "Username: <b>" + username + "</b>";

        });
    }

    var chatForm = document.getElementById("chatForm");

    if(chatForm.addEventListener){
        chatForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var messageContent = document.getElementById("chatInput").value;

            if(messageContent.trim().length === 0){
                return null;
            }else {
                document.getElementById("chatInput").value = null;
                socket.emit("sendChat_message", {message: messageContent})
            }
        })
    }

    var list = document.getElementById("messages");
    var messageContainer = document.getElementsByClassName("messageContainer")[0];

    socket.on('chat_information', function (message) {
        var entry = document.createElement('li');
        entry.appendChild(document.createTextNode(message));
        entry.setAttribute("class", "chatInformationMessage");
        list.appendChild(entry);
    });

    socket.on('chat_message', function (message) {
        var entry = document.createElement('li');
        entry.appendChild(document.createTextNode(message.username + ": " + message.content));
        list.appendChild(entry);
        messageContainer.scrollBy(0,100);
    });

    socket.on('disconnect', function () {
        // socket.id.replace("/handler#","");
        socket.emit("leave")
    });

    /*
    With this connection check function, we check if we are still connected to the server every 1 second..
    */
    // Check connection for the first time
    if(socket.connected === true){
        document.getElementsByClassName("connectionInformation")[0].innerHTML = "<h2><span class=\"badge badge-success\">Connected</span></h2>";

        // Enabling all buttons and other action-able things for showing
        // that the connection is alive. :)

        // "Join Room" - Button
        document.getElementsByClassName("joinRoomButton")[0].disabled = false;

        // "Message content" - Input field
        document.getElementById("chatInput").disabled = false;

        // "Leave Room" - Button
        document.getElementsByClassName("leaveRoomButton")[0].disabled = false;
    }else{
        document.getElementsByClassName("connectionInformation")[0].innerHTML = "<h2><span class=\"badge badge-danger\">Disconnected</span></h2>";

        // Disabling all buttons and other action-able things for showing
        // that the connection is dead. :(

        // "Join Room" - Button
        document.getElementsByClassName("joinRoomButton")[0].disabled = true;

        // "Message content" - Input field
        document.getElementById("chatInput").disabled = true;

        // "Leave Room" - Button
        document.getElementsByClassName("leaveRoomButton")[0].disabled = true;
    }

    // Now checking connection every sec
    setInterval(function () {
        if(socket.connected === true){
            document.getElementsByClassName("connectionInformation")[0].innerHTML = "<h2><span class=\"badge badge-success\">Connected</span></h2>";

            // Enabling all buttons and other action-able things for showing
            // that the connection is alive. :)

            // "Join Room" - Button
            document.getElementsByClassName("joinRoomButton")[0].disabled = false;

            // "Message content" - Input field
            document.getElementById("chatInput").disabled = false;

            // "Leave Room" - Button
            document.getElementsByClassName("leaveRoomButton")[0].disabled = false;
        }else{
            document.getElementsByClassName("connectionInformation")[0].innerHTML = "<h2><span class=\"badge badge-danger\">Disconnected</span></h2>";

            // Disabling all buttons and other action-able things for showing
            // that the connection is dead. :(

            // "Join Room" - Button
            document.getElementsByClassName("joinRoomButton")[0].disabled = true;

            // "Message content" - Input field
            document.getElementById("chatInput").disabled = true;

            // "Leave Room" - Button
            document.getElementsByClassName("leaveRoomButton")[0].disabled = true;
        }
    }, 1000);

    // Functionality of the leave Room button
    var leaveRoomButton = document.getElementsByClassName("leaveRoomButton")[0];
    if(leaveRoomButton.addEventListener){
        leaveRoomButton.addEventListener("click", function (event) {
            socket.emit("leave");

            // Showing Login form element
            loginForm.style.display = 'block';

            // Hiding Chat Container
            document.getElementsByClassName("chatContainer")[0].style.display = 'none';

            // Changing Headline
            document.getElementsByClassName("justAHeadline")[0].innerHTML = "<b>Welcome 🙋‍♂️</b>";

            // Displaying Chat Information container and "Leave Room" button
            document.getElementsByClassName("chatInformationContainer")[0].style.display = 'none';
            document.getElementsByClassName("chatLeaveRoomButtonContainer")[0].style.display = 'none';

            // Displaying information about the room and chat
            document.getElementsByClassName("chatInfo_room")[0].innerHTML = "";
            document.getElementsByClassName("chatInfo_username")[0].innerHTML = "";

            // Clearing chat
            list.innerHTML = "";
        });
    }

});

// Adding a zero if the hour, minute or seconds number is below zero
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// Function which returns the current date in a more readable string
function currentDate(/** Date */date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    var hour = addZero(date.getHours());
    var minute = addZero(date.getMinutes());
    var seconds = addZero(date.getSeconds());

    return "<" + month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + seconds + ">";
}

// Escaping html chars
// https://stackoverflow.com/a/6234804/7388353
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
