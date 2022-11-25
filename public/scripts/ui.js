const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        // Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#signin-overlay").hide();
        $("#information").hide();
        $("#login-instruction").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });

        // click to go back to front page
        $("#game-over").on("click", () => {
            $("#signout-button").click();
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
        $("#information").fadeIn(500);
        $("#login-instruction").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
        $("#information").fadeOut(500);
        $("#login-instruction").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    $("#game-over").hide();
                    $("#game-start").show();
                    $("#game-title").text("..Pairing Up..");
                    // SignInForm.initialize();
                    SignInForm.show();
                }
            );

        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            // $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            // $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function() {
    // This function initializes the UI
    const initialize = function() {};

    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

		// Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                );
            }
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { initialize, update, addUser, removeUser };
})();

const ChatPanel = (function() {
	// This stores the chat area
    let chatArea = null;

    // This function initializes the UI
    const initialize = function() {
		// Set up the chat area
		chatArea = $("#chat-area");

        // Submit event for the input form
        $("#chat-input-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the message content
            const content = $("#chat-input").val().trim();

			// Clear the message
            $("#chat-input").val("");
        });
 	};

    // This function updates the chatroom area
    const update = function(chatroom) {
        // Clear the online users area
        chatArea.empty();

        // Add the chat message one-by-one
        for (const message of chatroom) {
			addMessage(message);
        }
    };

    // This function adds a new message at the end of the chatroom
    const addMessage = function(message) {
		const datetime = new Date(message.datetime);
		const datetimeString = datetime.toLocaleDateString() + " " +
							   datetime.toLocaleTimeString();

		chatArea.append(
			$("<div class='chat-message-panel row'></div>")
				.append(UI.getUserDisplay(message.user))
				.append($("<div class='chat-message col'></div>")
					.append($("<div class='chat-date'>" + datetimeString + "</div>"))
					.append($("<div class='chat-content'>" + message.content + "</div>"))
				)
		);
		chatArea.scrollTop(chatArea[0].scrollHeight);
    };

    return { initialize, update, addMessage };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
			        user.avatar + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, OnlineUsersPanel, ChatPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();

const StartGame = (function() {
    let playerX, playerY;
    let gemX, gemY;

    const checkPair = function(onlineUsers) {
        
        // Get the current user
        const currentUser = Authentication.getUser();

        console.log("Checking on pairing.........");
        if (Object.keys(onlineUsers).length == 2){
            console.log(currentUser.username + " is pairing.........");
        }

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                console.log("checkPair: "+username + " is paired with you successfully.........");
                GameMechanics.countdown();
                break;
            }
        }
    };

    const newUser = function(user) {
		
        // Get the current user
        const currentUser = Authentication.getUser();
		
		// Pair the user
		if (user.username != currentUser.username) {
            console.log("newPair: "+user.username + " is paired with you successfully.........");
            GameMechanics.countdown();
        }
	};

    const setLocation = function(onlineUsers) {
        if (Object.keys(onlineUsers).length == 1) {
            playerX = 100;
            playerY = 430;
            gemX = 750;
            gemY = 430;
            console.log("set Player 1 Location");
        }
        else if (Object.keys(onlineUsers).length == 2) {
            playerX = 750;
            playerY = 430;
            gemX = 100;
            gemY = 430;
            console.log("set Player 2 Location");
        }
    }

    const retrieveLocation = function() {
        return {playerX, playerY, gemX, gemY};
    }

    return {checkPair, newUser, setLocation, retrieveLocation};
})();

const Playground = (function() {
    let statistics;
    let xLocation;
    let yLocation;
    let obstacles;
    
    const updateObstacles = function(updated) {
        obstacles = updated;
    };

    const getObstacles = function() {
        // console.log("--> before: "+obstacles.length);
        Socket.getObstacles();
        // console.log("--> after: "+obstacles.length);
        return obstacles;
    };

    const initiateLocation = function(username, x, y) {
        console.log("-> usr: "+username+"; x: "+x+"; y: " + y);
        Socket.inititatePlayerLocation(username, x, y);
    };

    const retrieveLocation = function(json) {
        xLocation = json["x"];
        yLocation = json["y"];
    };

    const getLastLocation = function() {
        Socket.getLocation();
        console.log("Playground: "+xLocation+", "+yLocation);
        return {xLocation, yLocation};
    };

    const initiateStatistics = function(username){
        Socket.initiateStatistics(username);
    };

    // retrieve the stat from socket
    const retrieveStatistics = function(json) {
        statistics = json;
    };

    // check whether either player has achieved winning condition
    const gemIsCollected = function() {
        Socket.getStatistics();
        console.log(statistics);
        if (statistics == undefined || statistics.length == 0 || statistics.length == 1) return false;
        // console.log("Statistics are full to check");
        let username = Authentication.getUser().username;
        let opponentName;
        if (statistics[0]["user"]["username"] == username){
            opponentName = statistics[1]["user"]["username"];
        } else {
            opponentName = statistics[0]["user"]["username"];
        }
        if (statistics[0]["user"]["gem"] == 1 || statistics[1]["user"]["gem"] == 1){
            // setting for the winner player 
            if ((statistics[0]["user"]["gem"] == 1 && statistics[0]["user"]["username"] == username) ||
                (statistics[1]["user"]["gem"] == 1 && statistics[1]["user"]["username"] == username)){
                $("#game-over-title").text("YOU WIN!");
                $("#game-over-rank1").text("1. " + username);
                $("#game-over-rank2").text("2. " + opponentName);
            } 
            // setting for the loser player
            else {
                $("#game-over-rank1").text("1. " + opponentName);
                $("#game-over-rank2").text("2. " + username);
            }
            // setting for statistics
            $("#game-over-player1").text("Player "+statistics[0]["user"]["username"]);
            $("#game-over-player2").text("Player "+statistics[1]["user"]["username"]);
            $("#game-over-gem1").text("Energy Core: "+statistics[0]["user"]["gem"]);
            $("#game-over-gem2").text("Energy Core: "+statistics[1]["user"]["gem"]);
            $("#game-over-set1").text("Obstacles Set: "+statistics[0]["user"]["numObstaclesSet"]);
            $("#game-over-set2").text("Obstacles Set: "+statistics[1]["user"]["numObstaclesSet"]);
            $("#game-over-destroy1").text("Obstacles Burnt: "+statistics[0]["user"]["numObstaclesBurnt"]);
            $("#game-over-destroy2").text("Obstacles Burnt: "+statistics[1]["user"]["numObstaclesBurnt"]);

            return true;
        } else {
            $("#game-over-rank1").text("Participated: " + username);
            $("#game-over-rank2").text("Participated: " + statistics[0]["user"]["username"]);
            return false;
        }
    };

    // when either user gets the gem
    const updateGemStatistics = function(username) {
        Socket.updateGemStatistics(username);
    };

    const updateNumObstacleSet = function() {
        Socket.updateNumObstacleSet(Authentication.getUser().username);
    };

    return { updateObstacles, getObstacles, 
        initiateLocation, retrieveLocation, getLastLocation, 
        initiateStatistics, retrieveStatistics, gemIsCollected,
        updateGemStatistics, updateNumObstacleSet };
})();
