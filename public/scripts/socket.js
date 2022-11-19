const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list (emit: browser sending request)
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");

            // Get the obstacles
            socket.emit("get obstacles");
        });

        // Set up the users event (on: receiving)
        // get back the online user list from the server
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            
            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
            StartGame.checkPair(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
            StartGame.newUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the obstacles event
        socket.on("obstacles", (obstacles) => {
            obstacles = JSON.parse(obstacles);
            console.log(obstacles);
            Playground.updateObstacles(obstacles);
        });

        socket.on("add obstacle", (obstacle) => {
            obstacle = JSON.parse(obstacle);

        });
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    // This function adds an obstacle evenr to the server
    const addObstacle = function(newObstacle) {
        if (socket && socket.connected) {
            console.log("....1....");
            socket.emit("post obstacle", newObstacle);
        }
    }

    return { getSocket, connect, disconnect, postMessage, addObstacle };
})();
