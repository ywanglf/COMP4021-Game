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
            StartGame.setLocation(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
            StartGame.newUser(user);
        });

        // socket.on("count", (numOnlineUsers) => {
        //     Playground.retrieveNumOnlineUsers(numOnlineUsers);
        // });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the obstacles event
        socket.on("obstacles", (obstacles) => {
            obstacles = JSON.parse(obstacles);
            // console.log(obstacles);
            Playground.updateObstacles(obstacles);
        });

        socket.on("add obstacle", (obstacle) => {
            obstacle = JSON.parse(obstacle);

        });
        
        socket.on("fires", (fires) => {
            fires = JSON.parse(fires);
            // console.log(fires);
            Playground.updateFires(fires);
        });

        socket.on("add fire", (fire) => {
            fire = JSON.parse(fire);
            // console.log(fire)
        });

        socket.on("location", (json) => {
            console.log("location; x = "+json["x"]+"; y = "+json["y"]);
            Playground.retrieveLocation(json);
        });

        // retrieve the statistics
        socket.on("statistics", (statistics) => {
            Playground.retrieveStatistics(statistics);
        });
        
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // const countUsers = function() {
    //     if (socket && socket.connected) {
    //         socket.emit("count users");
    //     }
    // };

    // This function adds an obstacle evenr to the server
    const addObstacle = function(newObstacle) {
        if (socket && socket.connected) {
            socket.emit("post obstacle", newObstacle);
        }
    };

    // This function obtains all obstacles event to the server
    const getObstacles = function(){
        if (socket && socket.connected) {
            socket.emit("get obstacles");
        }
    };
    
    const addFire = function(newFire) {
        if (socket && socket.connected) {
            socket.emit("post fire", newFire);
            // console.log("socket post fire " + newFire)
        }
    };

    const getFires = function(){
        if (socket && socket.connected) {
            socket.emit("get fires");
        }
    };

    const inititatePlayerLocation = function(username, x, y){
        if (socket && socket.connected) {
            socket.emit("initiate location", username, x, y);
        }
    };

    // This function stores the new location of the player
    const lastLocation = function(x, y) {
        if (socket && socket.connected) {
            socket.emit("change location", x, y);
        }
    };

    const getLocation = function(x, y) {
        if (socket && socket.connected) {
            socket.emit("get location", x, y);
        }
    };

    const initiateStatistics = function(username) {
        if (socket && socket.connected) {
            socket.emit("initiate statistics", username);
        }
    };

    // reqeust the stat from server
    const getStatistics = function() {
        if (socket && socket.connected) {
            socket.emit("get statistics");
        }
    };

    const updateGemStatistics = function(username) {
        if (socket && socket.connected) {
            socket.emit("update gem statistics", username);
        }
    };

    const updateNumObstacleSet = function(username) {
        if (socket && socket.connected) {
            socket.emit("update num obstacles set statistics", username);
        }
    }

    const updateNumObstacleBurnt = function(username) {
        if (socket && socket.connected) {
            socket.emit("update num obstacles burnt statistics", username);
        }
    }

    

    const updateNumFireSet = function(username) {
        if (socket && socket.connected) {
            socket.emit("update num fire set statistics", username);
        }
    }

    return { getSocket, connect, disconnect, postMessage, 
        addObstacle, getObstacles, 
        inititatePlayerLocation, lastLocation, getLocation, 
        initiateStatistics, getStatistics, 
        updateGemStatistics, updateNumObstacleSet, updateNumObstacleBurnt, getFires, addFire, updateNumFireSet };
})();
