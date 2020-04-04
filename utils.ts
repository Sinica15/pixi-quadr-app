export default class Utils {
    static distanceBetween = (x1: number, y1:number, x2:number, y2:number):number =>  {
        return Math.hypot(x1 - x2, y1 - y2);
    };

    static deepCopy = (obj: object): object => {
        return JSON.parse(JSON.stringify(obj));
    }
}