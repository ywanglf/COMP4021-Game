const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const gameSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(gameSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));

    //
    // Checking for the user data correctness
    // if any field is empty, return an error
    if (!username || !avatar || !name || !password){
        res.json({
            status: "error",
            error: "Username/avatar/name/password cannot be empty."
        });

        return;
    }

    // if the username contains invalid characters, return an error
    if (!containWordCharsOnly(username)){
        res.json({
            status: "error",
            error: "Username can only contain underscores, letters or numbers."
        });

        return;
    }
    
    // if username exists, return an error
    if (username in users){
        res.json({
            status: "error",
            error: "Username has already been used."
        });
    }

    //
    // Adding the new user account
    // hash the password
    const hash = bcrypt.hashSync(password, 10);
    // add the new user into the record
    users[username] = { avatar, name, password: hash };

    //
    // Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

    //
    // I. Sending a success response to the browser
    //
    res.json({ 
        status: "success"
    });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // Reading the users.json file
    // read the user data
    const users = JSON.parse(fs.readFileSync("data/users.json"));

    //
    // Checking for username/password
    // if username does not exist, return an error
    if (!(username in users)){
        res.json({ 
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    // get the user
    const user = users[username];

    // if password is incorrect, return an error
    if (!bcrypt.compareSync(password, user.password)){
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    //
    // Sending a success response with the user account
    // save the user information in the current session
    req.session.user = { username, avatar: user.avatar, name: user.name };
    res.json({ 
        status: "success",
        user: req.session.user
    });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // Getting req.session.user
    // if the user has not signed in, return an error
    if (!req.session.user){
        res.json({
            status: "error",
            error: "You have not signed in."
        });
        return;
    }

    //
    // Sending a success response with the user account
    //
    res.json({
        status: "success",
        user: req.session.user
    });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    if (req.session.user){
        delete req.session.user;
    }

    //
    // Sending a success response
    //
    res.json({
        status: "success"
    });
});



//
// ***** Please insert your Lab 6 code here *****
//
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

// A JavaScript object storing online users
const onlineUsers = {}

// Handle the web socket connection
io.on("connection", (socket) => {
    // Add a new user to the online user list
    if (socket.request.session.user){
        const { username, avatar, name } = socket.request.session.user;
        onlineUsers[username] = { avatar, name };
        console.log("add to online users: "+ username);

        // Broadcast the signed-in user to browser
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }

    // Set up the disconnect event (as the connection has already been setup, does not need to listen to io)
    socket.on("disconnect", () => {
        // Remove the user from online user list
        if (socket.request.session.user){
            const { username } = socket.request.session.user;
            if (onlineUsers[username])
                delete onlineUsers[username];
            console.log("remove from online users: "+ username);

            // Broadcast the signed-out user
            io.emit("remove user", JSON.stringify(socket.request.session.user));
        }
    });

    // Set up the get users event
    socket.on("get users", () => {
        // Send the online users to the browser
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    // Set up the get obstacles event
    socket.on("get obstacles", () => {
        const obstacles = JSON.parse(fs.readFileSync("data/obstacles.json"));
        io.emit("obstacles", JSON.stringify(obstacles));
    });

    // Set up the add obstacles event
    socket.on("post obstacle", obstacle => {
        console.log("....2....");
        // console.log("game server post obstacles: "+obstacle.x);,
        let x = obstacle.x;
        let y = obstacle.y;
        const json = {
            anyName: { x, y }
        }
        console.log("--> json: "+json);
        const obstacles = JSON.parse(fs.readFileSync("data/obstacles.json"));
        console.log(obstacles);
        obstacles.push(json);
        fs.writeFileSync("data/obstacles.json", JSON.stringify(obstacles, null, " "));
        // Broadcast the message
        io.emit("obstacles", JSON.stringify(obstacles));
        socket.emit("add obstacle", JSON.stringify(obstacle));
    });

    socket.on("change location", (x, y) => {
        const { username } = socket.request.session.user;
        const json = {
            user: {username, x, y}
        }
        console.log("--> json: "+json["user"]["username"]);
        console.log("--> server side: "+username+": "+x+", "+y);
        const locations = JSON.parse(fs.readFileSync("data/location.json"));
        if (locations[0]["user"]["username"] == username){
            locations[0]["user"]["x"] = x;
            locations[0]["user"]["y"] = y;
            console.log("==> 1 matched");
        }
        else if (locations[1]["user"]["username"] == username) {
            locations[1]["user"]["x"] = x;
            locations[1]["user"]["y"] = y;
            console.log("==> 2 matched");
        }
        fs.writeFileSync("data/location.json", JSON.stringify(locations, null, " "));
    });

    socket.on("get location", () => {
        const { username } = socket.request.session.user;
        const locations = JSON.parse(fs.readFileSync("data/location.json"));
        let x;
        let y;
        if (locations[0]["user"]["username"] == username){
            x = locations[0]["user"]["x"];
            y = locations[0]["user"]["y"];
        }
        else if (locations[1]["user"]["username"] == username) {
            x = locations[1]["user"]["x"];
            y = locations[1]["user"]["y"];
        }

        io.emit("location", (x, y));
    });
});

// Use the Socket.io Server 
io.use((socket, next) => {
    gameSession(socket.request, {}, next)
});

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game server has started...");
});
