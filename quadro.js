import * as PIXI from "pixi.js";
import * as sha256 from "js-sha256";

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function Quadro(id, x, y, initialScale, vx, vy) {
    this.selfTime = 0;
    this.timers = {
        neighboursTimer: 1000,
        commonTimer: 0,
    };

    this.id_name = id;
    this.initPosition = {x, y};
    this.stuckLocation = {};
    this.initScale = initialScale || 0.5;

    this.vx = vx || 0;
    this.vy = vy || 0;

    this.targetPosition = null;

    this.maxSpeed = 13;
    this.speedCoef = 0.1;

    this.safeRadius = 90 * this.initScale + 10;
    this.nearRadius = 600 * this.initScale;
    this.quadroSwarm = [];
    this.neighbours = [];

    /*
    * Tasks in JSON object
    * */
    this.currentTasks = [];
    /*
    * Tasks in JSON object
    * */
    this.completedTasks = [];
    /*
    * Row task in string, can parsed in JSON object
    * */
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

Quadro.prototype.getCurrentPosition = function() {
    return {x: this.bodyQuadro.x, y: this.bodyQuadro.y }
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
    this.neighbours.forEach(neig => {
        if (!neig._haveThisTask(sha256(this.taskForNotification))) {
            neig.setTaskForNotification(this.taskForNotification);
        }
    });
    this.taskForNotification = null;
};

Quadro.prototype.setTaskForNotification = function(task) {
    this.currentTasks.push(JSON.parse(task));
    this.taskForNotification = task;
};

Quadro.prototype._haveThisTask = function(task_hash) {
    let have = false;
    this.completedTasks.forEach(task => {
        if (sha256(JSON.stringify(task)) == task_hash) have = true;
    });
    if (have) return have;
    this.currentTasks.forEach(task => {
        if (sha256(JSON.stringify(task)) == task_hash) have = true;
    });
    return have;
};

Quadro.prototype._doTasks = function() {
    this.currentTasks.forEach(task => {
        switch (task.action) {
            case "move":
                this.setTargetPosition(task.to.x, task.to.y);
                break;
            case "f":
                console.log(this.id_name + " pay respect");
                break;
            default:
                /*
                * Do nothing
                * */
        }
        this.completedTasks.push(task);
    });
    this.currentTasks = [];
};

/*
* Life/Movement cycle
* */
Quadro.prototype._timeIsRunning = function() {
    this.selfTime++;
    Object.keys(this.timers).forEach(key => {
        if (this.timers[key]) this.timers[key]--;
    })
};

Quadro.prototype.setCommonTimer = function(time) {
    this.timers.commonTimer = time;
};

Quadro.prototype.doStep = function () {

    this._timeIsRunning();
    this._checkNeighbours();
    this._doTasks();
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
                        // this.completedTasks[0]
        ((this.vx == 0 && this.vy == 0) ? "S" : "M");
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

Quadro.prototype._distanceBetween = function(x1, y1, x2, y2) {
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

    if (this.distanceTo(this.targetPosition) < 7 || neighboursTimer()) {
        this.targetPosition = null;
        this.vx = 0;
        this.vy = 0;
    }

    // this.setVelocity(newVx, newVy);
    function neighboursTimer() {
        let stuckCoef = 1.45;
        let speedCoef = 1.3;
        let neigTime  = 360;
        let checkCloseNeig = 0;
        self.neighbours.forEach(neig => {
            if (self.distanceTo(neig.getCurrentPosition()) < (self.safeRadius + neig.safeRadius) * stuckCoef) {
                checkCloseNeig++;
            }
        });
        if (self.distanceTo(self.stuckLocation) < (self.maxSpeed * speedCoef)) {
            if (checkCloseNeig >= 3) {
                if (self.timers.neighboursTimer == 0) return true;
            } else {
                self.timers.neighboursTimer = neigTime;
            }
        } else {
            self.stuckLocation = self.getCurrentPosition();
        }


    }

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
