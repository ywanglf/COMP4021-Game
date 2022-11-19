const Obstacle = function(ctx, x, y) {
    // const sequence = { x: 50, y:  50, width: 50, height: 50, count: 1, timing: 200, loop: false };  //use halloween_sprite.png
    const sequence = { x: 176, y:  48, width: 16, height: 16, count: 1, timing: 200, loop: false };  //use object_sprites.png

    const sprite = Sprite(ctx, x, y);
    sprite.setSequence(sequence)
        .setScale(3) 
        .setShadowScale({ x: 0, y: 0 })
        // .useSheet("static/halloween_sprite.png");
        .useSheet("static/object_sprites.png");


    // // This function tests whether a point is in the bounding box.
    // // - `x`, `y` - The (x, y) position to be tested
    // const isPointInBox = function(x, y) {
    //     const {x, y} = sprite.getXY();
    //     const box = player.getBoundingBox();
    //         if (box.isPointInBox(x, y)){
    //             // sounds.collect.play();
    //             $("#game-over").show();
    //             return;
    //             // gem.randomize(gameArea);
    //         }
    //     return ctx.isPointInPath(path, x, y);
    // };
        
    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};