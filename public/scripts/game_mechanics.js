const GameMechanics = (function() {
    let counting = 3;
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
        // canvas width & height: 854, 480;
        const gameArea = BoundingBox(context, 50, 100, 430, 750);

        /* Create the sprites in the game */

        // Private setting: ghost player being the 亡灵 of the skeleton lolll:P
        const skeleton1 = Skeleton(context, 50, 410);
        const skeleton2 = Skeleton(context, 800, 410);
        
        console.log("---> "+Authentication.getUser().avatar);
        
        //Create the player
        var player;
        if (Authentication.getUser().avatar == "white"){
            player = Player(context, 100, 430, gameArea);
        }
        else if (Authentication.getUser().avatar == "green"){
            player = Player2(context, 100, 60, gameArea);
        }
        
        
        /* The main processing of the game */
        function doFrame(now) {
            
            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);


            /* Handle the game over situation here */
            if (timeRemaining == 0) {
                sounds.background.pause();
                // sounds.collect.pause();
                // sounds.gameover.play();
                // $("#final-gems").text(collectedGems);
                $("#game-over").show();
                return;
            }
            

            /* Update the sprites */
            skeleton1.update(now);
            skeleton2.update(now);
            player.update(now);


            /* TODO */
            /* Randomize the gem and collect the gem here */
            

            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            skeleton1.draw();
            skeleton2.draw();
            player.draw();

            console.log("player: "+JSON.stringify(player));
            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }


        // $("#game-start").on("click", function() {
            /* Hide the start screen */
            $("#game-start").hide();
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
        // });

    };

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
            setTimeout(begin, 1000);
        }
    };

    return {countdown, begin};
})();