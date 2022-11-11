const Skeleton = function(ctx, x, y) {
    const sequence = { x: 0, y:  100, width: 50, height: 50, count: 3, timing: 200, loop: true };

    const sprite = Sprite(ctx, x, y);
    sprite.setSequence(sequence)
        .setScale(2)
        .setShadowScale({ x: 0.75, y: 0.2 })
        .useSheet("skeleton_sprite.png");

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};