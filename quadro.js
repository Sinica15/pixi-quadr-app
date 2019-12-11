export function Quadro(id, x, y, vx, vy) {
    this.id_name = id;
    this.initPosition = {x, y};
    this.initScale = 0.5;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.targetPosition = null;
    this.maxSpeed = 3;
    this.speedCoef = 0.1;
}

Quadro.prototype.initQuadro = function (pixiObj) {
    this.bodyQuadro = pixiObj;
    this.bodyQuadro.x = this.initPosition.x;
    this.bodyQuadro.y = this.initPosition.y;
    this.bodyQuadro.scale.set(this.initScale, this.initScale);
    this.bodyQuadro.anchor.set(0.5, 0.5);
    this.bodyQuadro.rotation = 0;

};

Quadro.prototype.getPixiObject = function () {
    return this.bodyQuadro;
};

Quadro.prototype.setTargetPosition = function (x, y) {
    this.targetPosition = {x, y};
};

Quadro.prototype.move = function () {
    // console.log('moved!');

    if (this.targetPosition) moveToTargetPosition.call(this, this.targetPosition);

    this.bodyQuadro.x += this.speedCoef * this.vx;
    this.bodyQuadro.y += this.speedCoef * this.vy;


    if (!isNaN(Math.atan(this.vy/this.vx) + Math.PI/2)){
        this.bodyQuadro.rotation = (Math.atan(this.vy/this.vx) + Math.PI/2);
    }

    // console.log(
    //     this.id_name,
    //     this.bodyQuadro.x,
    //     this.bodyQuadro.y,
    //     this.bodyQuadro.rotation
    // );
};

function moveToTargetPosition(targetPosition) {
    // console.log(this);

    let deltaX = targetPosition.x - this.bodyQuadro.x;
    let deltaY = targetPosition.y - this.bodyQuadro.y;

    let correctionAngle = 0;

    if (deltaX < 0 && deltaY < 0) correctionAngle = Math.PI;
    if (deltaX > 0 && deltaY < 0) correctionAngle = Math.PI;

    let angleToPos = Math.atan(deltaX /deltaY) + correctionAngle;
    let newVx = this.maxSpeed * Math.sin(angleToPos);
    let newVy = this.maxSpeed * Math.cos(angleToPos);

    // console.log(this.id_name, deltaX, deltaY);
    // console.log(angleToPos, newVx, newVy);
    // console.log(targetPosition.x, this.bodyQuadro.x, targetPosition.y, this.bodyQuadro.y);

    this.vx = newVx;
    this.vy = newVy;
}
