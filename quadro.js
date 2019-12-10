export function Quadro(x, y, vx, vy) {
    this.initx = x;
    this.inity = y;
    this.initScale = 0.9;
    this.vx = vx || 0;
    this.vy = vy || 0;

}

Quadro.prototype.initQuadro = function (pixiObj) {
    this.bodyQuadro = pixiObj;
    this.bodyQuadro.x = this.initx;
    this.bodyQuadro.y = this.inity;
    this.bodyQuadro.scale.set(this.initScale, this.initScale);
    this.bodyQuadro.anchor.set(0.5, 0.5);
    this.bodyQuadro.rotation = 0;

};

Quadro.prototype.getPixiObject = function () {
    return this.bodyQuadro;
};

Quadro.prototype.move = function () {
    // console.log('moved!');
    let coef = 0.5;
    this.bodyQuadro.x += coef * this.vx;
    this.bodyQuadro.y += coef * this.vy;
    // this.bodyQuadro.rotation = (Math.atan(this.vx/this.vy) + Math.PI);
    // this.bodyQuadro.rotation = 0;
    // this.bodyQuadro.rotation += 0.015;
};
