import * as PIXI from "pixi.js";
import * as sha256 from "js-sha256";
import utils from "./utils";

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

type Position = {
    x: number;
    y: number;
}


export class Quadro {
    private selfTime: number = 0;
    private timers: { neighboursTimer: number; commonTimer: number } = {
        neighboursTimer: 1000,
        commonTimer: 0,
    };
    private readonly id_name: string | number;
    private initPosition: { x: number; y: number };
    private stuckLocation: {};
    private initScale: number;
    private vx: number = 0;
    private vy: number = 0;
    //todo add type
    private targetPosition: Position;
    private maxSpeed: number = 13;
    private speedCoef: number = 0.1;

    private readonly safeRadius: number;
    private readonly nearRadius: number;

    private quadroSwarm: Quadro[];
    private neighbours: Quadro[];
    //todo add types
    private currentTasks: any[] = [];
    private completedTasks: any[] = [];
    private taskForNotification: any = null;

    private directionVector: PIXI.Graphics = new PIXI.Graphics();
    private labelScale: number = 0.45;
    private labelText: PIXI.Text = new PIXI.Text("", {
        fontFamily: "Arial",
        fontSize: 30,
        fill: "green",
        stroke: '#ffffff',
        strokeThickness: 5
    });

    private bodyQuadro: any;

    constructor(
        id: string | number,
        x: number,
        y: number,
        initialScale?: number,
        vx?: number,
        vy?: number,
    ) {
        this.id_name = id;
        this.initPosition = {x, y};
        this.initScale = initialScale || 0.5;

        this.vx = vx || 0;
        this.vy = vy || 0;

        this.safeRadius = 90 * this.initScale + 10;
        this.nearRadius = 600 * this.initScale;
    }
    /*
    * Initialization functions
    * */

    initQuadro(pixiObj, quadros) {
        this.quadroSwarm = quadros;
        this.bodyQuadro = pixiObj;
        this.bodyQuadro.x = this.initPosition.x;
        this.bodyQuadro.y = this.initPosition.y;
        this.bodyQuadro.scale.set(this.initScale, this.initScale);
        this.bodyQuadro.anchor.set(0.5, 0.5);
        this.bodyQuadro.rotation = 0;
    };

    getPixiObjects() {
        this.directionVector.lineStyle(2, 0xFF0000, 1);
        let angle = this.bodyQuadro.rotation - Math.PI / 2;
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

    getCurrentPosition() {
        return {x: this.bodyQuadro.x, y: this.bodyQuadro.y}
    };

    setTargetPosition(x: number, y:number) {
        this.targetPosition = {x, y};
    };

    /*
* Communication/Notification functions
* */

    private checkNeighbours() {
        this.neighbours = [];
        this.quadroSwarm.forEach(quad => {
            let distance = this.distanceTo(quad.bodyQuadro.x, quad.bodyQuadro.y);
            if (distance < this.nearRadius && distance > (this.safeRadius + quad.safeRadius)) this.neighbours.push(quad);
        });
    };

    private notifyNeighbours() {
        if (!this.taskForNotification) {
            return 0;
        }
        this.neighbours.forEach(neig => {
            if (!neig.haveThisTask(sha256(this.taskForNotification))) {
                neig.setTaskForNotification(this.taskForNotification);
            }
        });
        this.taskForNotification = null;
    };

    setTaskForNotification(task) {
        this.currentTasks.push(JSON.parse(task));
        this.taskForNotification = task;
    };

    haveThisTask(task_hash: string) {
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

    private doTasks() {
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
    private timeIsRunning() {
        this.selfTime++;
        Object.keys(this.timers).forEach(key => {
            if (this.timers[key]) this.timers[key]--;
        })
    };

    setCommonTimer(time) {
        this.timers.commonTimer = time;
    };

    doStep() {

        this.timeIsRunning();
        this.checkNeighbours();
        this.doTasks();
        this.notifyNeighbours();
        this._velocityCorrection();

        this.bodyQuadro.x += this.speedCoef * this.vx;
        this.bodyQuadro.y += this.speedCoef * this.vy;

        this.directionVector.x += this.speedCoef * this.vx;
        this.directionVector.y += this.speedCoef * this.vy;

        let bodyRotationAngle = Math.atan(this.vy / this.vx) + Math.PI / 2;
        if (!isNaN(bodyRotationAngle)) {
            let correctionAngle = 0;
            if (this.vx < 0) correctionAngle = Math.PI;
            this.bodyQuadro.rotation = bodyRotationAngle + correctionAngle;
            this.directionVector.rotation = bodyRotationAngle + correctionAngle;
        }

        this.labelText.x = this.bodyQuadro.x;
        this.labelText.y = this.bodyQuadro.y - this.safeRadius - 10;
        let labelString = this.id_name + " " +
            this.bodyQuadro.x.toFixed() + " " +
            this.bodyQuadro.y.toFixed() + " " +
            this.neighbours.length + " " +
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

    // setVelocity(vx, vy) {
    //     let f = (val, setVal) => {
    //         if (setVal < 1) return 0;
    //         if (val < setVal) return val + 1 * this.speedCoef;
    //         if (val > setVal) return val - 1 * this.speedCoef;
    //     };
    //     this.vx = f(this.vx, vx);
    //     this.vy = f(this.vy, vy);
    // };

    distanceTo(x: number | {x: number, y: number}, y?: number) {
        if (typeof x == "object") {
            y = x.y;
            x = x.x;
        }
        return utils.distanceBetween(
            this.bodyQuadro.x,
            this.bodyQuadro.y,
            x, y
        );
    };

    _velocityCorrection() {
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
            let neigTime = 360;
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

        function aTnToPoint(x: number | {x: number, y: number}, y?: number) {
            if (typeof x == "object") {
                y = x.y;
                x = x.x;
            }
            let deltaX = x - self.bodyQuadro.x;
            let deltaY = y - self.bodyQuadro.y;

            let correctionAngle = 0;

            if (deltaX < 0 && deltaY < 0) correctionAngle = Math.PI + Math.PI / 8;
            if (deltaX > 0 && deltaY < 0) correctionAngle = Math.PI + Math.PI / 8;

            return Math.atan(deltaX / deltaY) + correctionAngle;
        }

        function checkCollision(): Quadro | boolean {
            let res = false;
            self.neighbours.forEach(neig => {
                if (utils.distanceBetween(
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

}
