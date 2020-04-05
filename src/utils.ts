import {Position} from "./types";

export default class Utils {

    static distanceBetweenD(x1: number, y1: number, x2: number, y2: number): number {
        return Math.hypot(x1 - x2, y1 - y2);
    };

    static distanceBetweenP(pos1: Position, pos2: Position): number {
        return Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y);
    };

    static aTnBetweenD(x1: number, y1: number, x2: number, y2: number) {
        let deltaX = x1 - x2;
        let deltaY = y1 - y2;
        return this.aTn(deltaX, deltaY);
    };

    static aTnBetweenP(pos1: Position, pos2: Position): number {
        let deltaX = pos1.x - pos2.x;
        let deltaY = pos1.y - pos2.y;
        return this.aTn(deltaX, deltaY);
    };

    static deg = (rad: number): number => rad / Math.PI * 180;

    static deepCopy = (obj: object): object => {
        return JSON.parse(JSON.stringify(obj));
    };

    private static aTn(deltaX: number, deltaY: number): number {
        let correctionAngle = 0;
        const piCorrection = Math.PI;
        if (deltaX > 0 && deltaY > 0) correctionAngle = piCorrection;
        if (deltaX < 0 && deltaY > 0) correctionAngle = - piCorrection;

        const atan = Math.atan(deltaX / deltaY) + correctionAngle;
        //todo something goes wrong
        if (atan > Math.PI || atan < -Math.PI) {
            if (atan > Math.PI) {
                return atan - 2 * Math.PI
            } else {
                return atan + 2 * Math.PI
            }
        }
        return atan;
    };
}