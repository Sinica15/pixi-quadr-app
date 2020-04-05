// @ts-ignore
import * as PIXI from "pixi.js";

export default class moveController {
    x: number;
    y: number;
    angle: number;
    vx: number;
    vy: number;
    private readonly maxSpeed: number;
    private readonly maxAngleSpeed: number;
    //@ts-ignore
    quadBody: PIXI.Sprite;

    //@ts-ignore
    constructor(x: number, y: number, initScale: number, startAngle: number, maxSpeed: number, maxAngleSpeed: number, quadBody: PIXI.Sprite) {
        this.x = x;
        this.y = y;
        this.angle = startAngle;
        this.maxSpeed = maxSpeed;
        this.maxAngleSpeed = maxSpeed;
        this.quadBody = quadBody;

        this.quadBody.x = this.x;
        this.quadBody.y = this.y;
        this.quadBody.rotation = this.angle;
        this.quadBody.scale.set(initScale, initScale);
        this.quadBody.anchor.set(0.5, 0.5);
    }

    moveW(power?: number) {
        power || (power = 1);
        this.vx = this.maxSpeed * Math.sin(this.angle) * power;
        this.vy = this.maxSpeed * Math.cos(this.angle) * power;

        //todo add inertia system
        this.x += this.vx;
        this.y += this.vy;
        this.quadBody.x = this.x;
        this.quadBody.y = this.y;
    }

    rotate(power?: number) {
        power || (power = 1);

        // power = 0.001;
        //todo add inertia system

        // this.angle += this.maxAngleSpeed * power;
        this.increaseAngle(this.maxAngleSpeed * power);
        this.quadBody.rotation = -this.angle;
    }

    private increaseAngle(value: number) {
        const sum = this.angle + value;
        if (sum > Math.PI || sum < -Math.PI) {
            // console.log(`sum: ${sum}, ${this.angle} + ${value}`);
            if (sum > Math.PI) {
                return this.angle = sum - 2 * Math.PI
            } else {
                 return this.angle = sum + 2 * Math.PI
            }
        } else {
            return this.angle = sum;
        }
    }
}