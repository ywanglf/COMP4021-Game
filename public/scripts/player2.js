// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player2 = function(ctx, x, y, gameArea, obstacles) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Moving sprite sequences for facing different directions */
        moveDown:  { x: 288, y: 0, width: 48, height: 48, count: 6, timing: 500, loop: true },
        moveLeft:    { x: 288, y: 48, width: 48, height: 48, count: 6, timing: 500, loop: true },
        moveRight: { x: 288, y: 96, width: 48, height: 48, count: 6, timing: 500, loop: true },
        moveUp:  { x: 288, y: 144, width: 48, height: 48, count: 6, timing: 500, loop: true }
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.moveDown)
          .setScale(1.5)
        //   .setShadowScale({ x: 0.75, y: 0.20 })
            .setShadowScale({ x: 0, y: 0 })
          .useSheet("static/ghosts_sprite.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // save the last direction (just in case the ghost stops)
    let lastDirection = 0;

    // This is the moving speed (pixels per second) of the player
    let speed = 150;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 4 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
            lastDirection = dir;
        }
    };

    // This function stops the player from moving.
    // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function(dir) {
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = 0;
        }
    };

    // This function speeds up the player.
    const speedUp = function() {
        speed = 250;
    };

    // This function slows down the player.
    const slowDown = function() {
        speed = 150;
    };

    // This funtion lets player put an obstacle at current location if possible
    const putObstacle = function(){
        let { x, y } = sprite.getXY();
        let newObstacle;
        switch (lastDirection) {
            case 1: {
                // console.log("setting obstacle on the left");
                newObstacle = Obstacle(ctx, x-48-1, y);
                break;
            }
            case 2: {
                // console.log("setting obstacle on the top");
                newObstacle = Obstacle(ctx, x, y-1);
                break;
            }
            case 3: {
                // console.log("setting obstacle on the right");
                newObstacle = Obstacle(ctx, x+48+1, y);
                break;
            }
            case 4: {
                // console.log("setting obstacle on the bottom");
                newObstacle = Obstacle(ctx, x, y+48+1);
                break;
            }
        }
        var newBox = newObstacle.getBoundingBox();
        // console.log("--> new Box: "+newBox.getTop()+"; "+newBox.getLeft()+"; "+newBox.getBottom()+"; "+newBox.getRight()+"; ");

        let findIntersection = false;
        for (let i = 0; i < obstacles.length; i++){
            var box = obstacles[i].getBoundingBox();
            // console.log("-->     Box: "+box.getTop()+"; "+box.getLeft()+"; "+box.getBottom()+"; "+box.getRight()+"; ");
            if (box.intersect(newBox)){
                findIntersection = true;
                break;
            }
        }
        if (!findIntersection){
            Socket.addObstacle(newObstacle.getXY());
            obstacles.push(newObstacle);
        }
    };

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the player if the player is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();

            /* Move the player */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y)){

                // check whether it hits obstacle
                let findObstacle = false;
                for (let i = 0; i < obstacles.length; i++){
                    var box = obstacles[i].getBoundingBox();
                    // console.log("Bounding Box: "+box.getLeft()+"; "+box.getRight()+"; "+box.getTop()+"; "+box.getBottom()+"; ");
                    // console.log("Player Location: "+x+"; "+y);
                    if ((x >= box.getLeft() && x <= box.getRight() && y >= box.getTop() && y <= box.getBottom()) ||     // left bottom point
                        ((x+46) >= box.getLeft() && (x+46) <= box.getRight() && y >= box.getTop() && y <= box.getBottom())){    // right bottom point
                        findObstacle = true;
                        break;
                    }
                }

                if (!findObstacle)
                    sprite.setXY(x, y);
            }
               
        }
        /* Update the sprite object */
        sprite.update(time);
    };

    // The methods are returned as an object here.
    return {
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        putObstacle: putObstacle,
        update: update
    };
};