import * as PIXI from "pixi.js";
import * as sha256 from "js-sha256";

export function Quadro(id, x, y, initialScale,vx, vy) {
    this.id_name = id;
    this.initPosition = {x, y};
    this.initScale = initialScale || 0.5;

    this.vx = vx || 0;
    this.vy = vy || 0;

    this.targetPosition = null;

    this.maxSpeed = 13;
    this.speedCoef = 0.1;

    this.safeRadius = 90 * this.initScale;
    this.nearRadius = 600 * this.initScale;
    this.quadroSwarm = [];
    this.neighbours = [];

    this.notificatios = [];
    this.taskForNotification = null;

    this.directionVector = new PIXI.Graphics();
    // this.labelScale = 2.3 * this.initScale;
    this.labelScale = 0.45;
    this.labelText = new PIXI.Text("", {
        fontFamily: "Arial",
        fontSize: 30,
        fill: "green",
        stroke: '#ffffff',
        strokeThickness: 5
    });
}

/*
* Initialization functions
* */

Quadro.prototype.initQuadro = function (pixiObj, quadros) {
    this.quadroSwarm = quadros;
    this.bodyQuadro = pixiObj;
    this.bodyQuadro.x = this.initPosition.x;
    this.bodyQuadro.y = this.initPosition.y;
    this.bodyQuadro.scale.set(this.initScale, this.initScale);
    this.bodyQuadro.anchor.set(0.5, 0.5);
    this.bodyQuadro.rotation = 0;
};

Quadro.prototype.getPixiObjects = function () {
    this.directionVector.lineStyle(2, 0xFF0000, 1);
    let angle = this.bodyQuadro.rotation - Math.PI/2;
    // let endCord = {x: this.maxSpeed * 5 * Math.cos(angle), y: this.maxSpeed * 5 * Math.sin(angle)};
    let endCord = {x: this.safeRadius * Math.cos(angle), y: this.safeRadius * Math.sin(angle)};
    this.directionVector.moveTo(0, 0);
    this.directionVector.drawCircle(0, 0, this.safeRadius);
    this.directionVector.lineTo(endCord.x, endCord.y);
    this.directionVector.x = this.bodyQuadro.x;
    this.directionVector.y = this.bodyQuadro.y;

    this.labelText.x = this.initPosition.x;
    this.labelText.y = this.initPosition.y;
    this.labelText.anchor.set(0.5, 0.5);
    this.labelText.scale.set(this.labelScale, this.labelScale);

    return [this.labelText, this.directionVector, this.bodyQuadro];
};

Quadro.prototype.setTargetPosition = function (x, y) {
    this.targetPosition = {x, y};
};

/*
* Communication/Notification functions
* */

Quadro.prototype._checkNeighbours = function () {
    this.neighbours = [];
    this.quadroSwarm.forEach(quad => {
        let distance = this.distanceTo(quad.bodyQuadro.x, quad.bodyQuadro.y);
        if (distance < this.nearRadius && distance > (this.safeRadius + quad.safeRadius)) this.neighbours.push(quad);
    });
};

Quadro.prototype._notifyNeighbours = function () {
    if (!this.taskForNotification) {
        return 0;
    }
    this._incomingNotification(this.taskForNotification);
    // let notificationFlag = false;
    this.neighbours.forEach(neig => {
        if (!(sha256(JSON.stringify(neig.notificatios)) === sha256(JSON.stringify(this.notificatios)))) {
            neig.setTaskForNotification(this.taskForNotification);
        }
    });
    this.taskForNotification = null;
};

Quadro.prototype._incomingNotification = function(notification) {
    /*
    * something do
    * */
    this.notificatios.push(notification);
};

Quadro.prototype.setTaskForNotification = function(task) {
    this.taskForNotification = task;
};

/*
* Life/Movement cycle
* */

Quadro.prototype.doStep = function () {
    // console.log('moved!');

    this._checkNeighbours();
    this._notifyNeighbours();
    this._velocityCorrection();

    this.bodyQuadro.x += this.speedCoef * this.vx;
    this.bodyQuadro.y += this.speedCoef * this.vy;

    this.directionVector.x += this.speedCoef * this.vx;
    this.directionVector.y += this.speedCoef * this.vy;

    let bodyRotationAngle = Math.atan(this.vy/this.vx) + Math.PI/2;
    if (!isNaN(bodyRotationAngle)){
        let correctionAngle = 0;
        if (this.vx < 0) correctionAngle = Math.PI;
        this.bodyQuadro.rotation = bodyRotationAngle + correctionAngle;
        this.directionVector.rotation = bodyRotationAngle + correctionAngle;
    }

    this.labelText.x = this.bodyQuadro.x;
    this.labelText.y = this.bodyQuadro.y - this.safeRadius - 10;
    let labelString =   this.id_name + " " +
                        this.bodyQuadro.x.toFixed() + " " +
                        this.bodyQuadro.y.toFixed() + " " +
                        this.neighbours.length +  " " +
                        this.notificatios[0];
    this.labelText.text = labelString;

    // console.log(this.id_name, this.bodyQuadro.rotation, this.directionVector.rotation);

    if (0) console.log(
        this.id_name,
        this.bodyQuadro.x,
        this.bodyQuadro.y,
        // this.bodyQuadro.rotation
        this.neighbours,
    );
};

/*
* Movement functions
**/

Quadro.prototype.setVelocity = function(vx, vy) {
    let f = (val, setVal) => {
        if (setVal < 1) return 0;
        if (val < setVal) return  val + 1 * this.speedCoef;
        if (val > setVal) return  val - 1 * this.speedCoef;
    };
    this.vx = f(this.vx, vx);
    this.vy = f(this.vy, vy);
};

Quadro.prototype.distanceTo = function (x, y) {
    if (typeof x == "object") {y = x.y; x = x.x;}
    return this._distanceBetween(
        this.bodyQuadro.x,
        this.bodyQuadro.y,
        x, y
    );
};

Quadro.prototype._distanceBetween = function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

Quadro.prototype._velocityCorrection = function () {
    if (!this.targetPosition) {
        return 0;
    }

    // console.log(this);
    let self = this;

    let angleToPos = aTnToPoint(this.targetPosition);

    let newVx = this.maxSpeed * Math.sin(angleToPos);
    let newVy = this.maxSpeed * Math.cos(angleToPos);

    let collisionNeigh = checkCollision();
    if (collisionNeigh) {
        angleToPos = aTnToPoint(collisionNeigh.bodyQuadro.x, collisionNeigh.bodyQuadro.y) + Math.PI;

        newVx = this.maxSpeed * Math.sin(angleToPos);
        newVy = this.maxSpeed * Math.cos(angleToPos);
    }

    // console.log(this.id_name, deltaX, deltaY);
    // console.log(angleToPos, newVx, newVy);
    // console.log(targetPosition.x, this.bodyQuadro.x, targetPosition.y, this.bodyQuadro.y);

    this.vx = newVx;
    this.vy = newVy;

    if (this.distanceTo(this.targetPosition) < 3) {
        this.targetPosition = null;
        this.vx = 0;
        this.vy = 0;
    }

    // this.setVelocity(newVx, newVy);

    function aTnToPoint(x, y) {
        if (typeof x == "object") {y = x.y; x = x.x;}
        let deltaX = x - self.bodyQuadro.x;
        let deltaY = y - self.bodyQuadro.y;

        let correctionAngle = 0;

        if (deltaX < 0 && deltaY < 0) correctionAngle = Math.PI + Math.PI/8;
        if (deltaX > 0 && deltaY < 0) correctionAngle = Math.PI + Math.PI/8;

        return Math.atan(deltaX /deltaY) + correctionAngle;
    }

    function checkCollision() {
        let res = false;
        self.neighbours.forEach(neig => {
            if (self._distanceBetween(
                self.bodyQuadro.x + newVx,
                self.bodyQuadro.y + newVy,
                neig.bodyQuadro.x,
                neig.bodyQuadro.y
            ) <= (self.safeRadius + neig.safeRadius)) {
                res = neig;
            }
        });
        return res;
    }
};
