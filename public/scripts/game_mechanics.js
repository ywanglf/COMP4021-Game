const GameMechanics = (function() {
    let counting = 4;
    const begin = function() {
        // Start the game
        /* Get the canvas and 2D context */
        const cv = $("canvas").get(0);
        const context = cv.getContext("2d");

        /* Create the sounds */
        const sounds = {
            background: new Audio("music/background.mp3"),
            // collect: new Audio("collect.mp3"),
            // gameover: new Audio("gameover.mp3")
        };

        const totalGameTime = 240;   // Total game time in seconds
        const gemMaxAge = 3000;     // The maximum age of the gems in milliseconds
        let gameStartTime = 0;      // The timestamp when the game starts
        let collectedGems = 0;      // The number of gems collected in the game

        /* Create the game area */
                                        //top, left, bottom, right
        const gameArea = BoundingBox(context, 50, 100, 430, 750);


        
        /* Create the sprites in the game */

        // Create skeletons
        const skeleton1 = Skeleton(context, 50, 410);
        const skeleton2 = Skeleton(context, 800, 410);
        
        // Create Obstacle (Obstacle size: 48 x 48)
        let temp = Playground.getObstacles();
        let obstacles = [];

        for (let i = 0; i < temp.length; i++){
            obstacles.push(Obstacle(context, temp[i]["anyName"]["x"], temp[i]["anyName"]["y"]));
        }

        // Create the player as according the user setting
        var player;
        var gem;
        var fire;

        let {playerX, playerY, gemX, gemY} = StartGame.retrieveLocation();
        console.log(Authentication.getUser().username+ " location: " + playerX+", "+playerY);
        if (Authentication.getUser().avatar == "white"){
            player = Player(context, playerX, playerY, gameArea, 0);   // start from bottom left corner
            gem = Gem(context, gemX, gemY, "green");           // The eneger core of the opponent
            // Playground.initiateLocation(Authentication.getUser().username, 100, 430);   // inititate the location in json
            fire = Fire(context, 400, 430, "white")
        }
        else if (Authentication.getUser().avatar == "green"){
            player = Player(context, playerX, playerY, gameArea, 1);   // start from top right corner
            gem = Gem(context, gemX, gemY, "purple");         // The eneger core of the opponent
            // Playground.initiateLocation(Authentication.getUser().username, 750, 430);   // initiate the location in json
            fire = Fire(context, 400, 430, "green")
        }
        // Playground.getLastLocation();
        Playground.initiateStatistics(Authentication.getUser().username);
        console.log("enter doframe ....");
        
        
        /* The main processing of the game */
        function doFrame(now) {
            console.log("entered");
            $("#game-start").hide();
            $("#game-over").hide();

            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);


            /* Collect the gem here */
            const targetBox = gem.getBoundingBox();
            const box = player.getBoundingBox();

            // the first player reaching the gem
            if (box.intersect(targetBox)){
                // sounds.collect.play();
                Playground.updateGemStatistics(Authentication.getUser().username);  // update gem stat to 1
                // $("#game-over").show();
                // return;
            }
            /* Handle the game over situation here */
            if (Playground.gemIsCollected()){
                console.log("collected?");
                $("#game-over").show();
                return;
            }

            if (timeRemaining == 0) {
                sounds.background.pause();
                // sounds.collect.pause();
                // sounds.gameover.play();
                // $("#final-gems").text(collectedGems);
                $("#game-over").show();
                return;
            }
            

            /* Update the sprites */
            temp = Playground.getObstacles();
            obstacles = [];
            for (let i = 0; i < temp.length; i++){
                obstacles.push(Obstacle(context, temp[i]["anyName"]["x"], temp[i]["anyName"]["y"]));
            }
            obstacles.forEach(function(obstacle) {
                obstacle.update(now);
            });
            // obstacle.update(now);
            gem.update(now);
            skeleton1.update(now);
            skeleton2.update(now);
            player.update(now);
            fire.update(now);
            
            
            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            obstacles.forEach(function(obstacle) {
                obstacle.draw(now);
            });
            // obstacle.draw();
            gem.draw();
            skeleton1.draw();
            skeleton2.draw();
            player.draw();
            fire.draw()
            

            // console.log("player: "+JSON.stringify(player));
            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }


        // $("#game-start").on("click", function() {
            /* Hide the start screen */
            // $("#game-start").hide();
            // sounds.background.play();
            /* Handle the keydown of arrow keys and spacebar */
            $(document).on("keydown", function(event) {
                
                /* Handle the key down */
                // console.log("Pressing key: "+event.keyCode);
                switch (event.keyCode) {
                    case 37: player.move(1); break;
                    case 38: player.move(2); break;
                    case 39: player.move(3); break;
                    case 40: player.move(4); break;
                    case 32: player.speedUp(); break;

                    //key 'Q'
                    case 81: player.putObstacle(); break;
                }
            });

            /* Handle the keyup of arrow keys and spacebar */
            $(document).on("keyup", function(event) {


                /* Handle the key up */
                // console.log("Pressing key: "+event.keyCode);
                switch (event.keyCode) {
                    case 37: player.stop(1); break;
                    case 38: player.stop(2); break;
                    case 39: player.stop(3); break;
                    case 40: player.stop(4); break;
                    case 32: player.slowDown(); break;
                }
            });


            /* Start the game */
            requestAnimationFrame(doFrame);
        // }
        // });

    };

    // Countdown to start the game if pairing-up is down
    const countdown = function() {
        // Decrease the remaining time
        counting = counting - 1;
        console.log(counting);
        // Continue the countdown if there is still time;
        // otherwise, start the game when the time is up
        if (counting > 0){
            document.getElementById("game-title").innerHTML = counting;
            setTimeout(countdown, 1000);
        } else {
            document.getElementById("game-title").innerHTML = "Start!";
            counting = 4;
            setTimeout(begin, 1000);
        }
    };

    return {countdown, begin};
})();