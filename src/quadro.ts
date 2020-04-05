// @ts-ignore
import * as PIXI from "pixi.js";
// @ts-ignore
import * as sha256 from "js-sha256";

import utils from "./utils";
import moveController from "./moveController";

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
    private initPosition: Position;
    private stuckLocation: Position;
    private readonly initScale: number;
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

    // @ts-ignore
    private directionVector: PIXI.Graphics = new PIXI.Graphics();
    private labelScale: number = 0.45;
    // @ts-ignore
    private labelText: PIXI.Text = new PIXI.Text("", {
        fontFamily: "Arial",
        fontSize: 30,
        fill: "green",
        stroke: '#ffffff',
        strokeThickness: 5
    });

    private mc: moveController;

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
        this.initScale = initialScale || 0.3;

        this.vx = vx || 0;
        this.vy = vy || 0;

        this.safeRadius = 90 * this.initScale + 10;
        this.nearRadius = 600 * this.initScale;
    }
    /*
    * Initialization functions
    * */

    //@ts-ignore
    initQuadro(pixiObj: PIXI.Sprite, quadros: Quadro[]) {
        this.quadroSwarm = quadros;
        this.mc = new moveController(
            this.initPosition.x,
            this.initPosition.y,
            this.initScale,
            0,
            this.maxSpeed,
            pixiObj
        )
    };

    getPixiObjects() {
        this.directionVector.lineStyle(2, 0xFF0000, 1);
        let angle = this.mc.angle + Math.PI / 2;
        // let endCord = {x: this.maxSpeed * 5 * Math.cos(angle), y: this.maxSpeed * 5 * Math.sin(angle)};
        let endCord = {x: this.safeRadius * Math.cos(angle), y: this.safeRadius * Math.sin(angle)};
        this.directionVector.moveTo(0, 0);
        this.directionVector.drawCircle(0, 0, this.safeRadius);
        this.directionVector.lineTo(endCord.x, endCord.y);
        this.directionVector.x = this.mc.x;
        this.directionVector.y = this.mc.y;

        this.labelText.x = this.initPosition.x;
        this.labelText.y = this.initPosition.y;
        this.labelText.anchor.set(0.5, 0.5);
        this.labelText.scale.set(this.labelScale, this.labelScale);

        return [this.labelText, this.directionVector, this.mc.quadBody];
    };

    getCurrentPosition() {
        return {x: this.mc.x, y: this.mc.y}
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
            let distance = this.distanceTo(quad.mc.x, quad.mc.y);
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
    //todo task type
    setTaskForNotification(task: string) {
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
            // @ts-ignore
            if (this.timers[key]) this.timers[key]--;
        })
    };

    setCommonTimer(time: number) {
        this.timers.commonTimer = time;
    };

    doStep() {

        this.timeIsRunning();
        this.checkNeighbours();
        this.doTasks();
        this.notifyNeighbours();
        this.moveAndRotate();
        this.moveInfo();

    };

    moveInfo() {
        this.labelText.x = this.mc.x;
        this.labelText.y = this.mc.y - this.safeRadius - 10;
        const labelText = [
            this.id_name,
            this.mc.x.toFixed(),
            this.mc.y.toFixed(),
            this.neighbours.length,
            // this.completedTasks[0],
            this.targetPosition ? "have TP" : '',
            ((this.mc.vx == 0 && this.mc.vy == 0) ? "St" : "Mo")];
        this.labelText.text = labelText.join(' ');

        // console.log(this.id_name, this.mc.rotation, this.directionVector.rotation);
        this.directionVector.x = this.mc.x;
        this.directionVector.y = this.mc.y;
        this.directionVector.rotation = -this.mc.angle;

        if (0) console.log(
            this.id_name,
            this.mc.x,
            this.mc.y,
            // this.mc.rotation
            this.neighbours,
        );
    };

    /*
    * Movement functions
    **/
    distanceTo(x: number | {x: number, y: number}, y?: number) {
        if (typeof x == "object") {
            y = x.y;
            x = x.x;
        }
        return utils.distanceBetween(
            this.mc.x,
            this.mc.y,
            x, y
        );
    };

    private moveAndRotate() {
        if (this.mc.y > 200 || this.mc.y < 100 ) this.mc.rotate(-0.01);
        this.mc.moveW(0.05);
    };

}
