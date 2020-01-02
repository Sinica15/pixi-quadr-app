import * as PIXI from 'pixi.js';
import {Quadro} from "./quadro";

// import "./plot";

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas"
}

PIXI.utils.sayHello(type);

//Create a Pixi Application
let app = new PIXI.Application({
    width: 800,         // default: 800
    height: 350,        // default: 600
    antialias: true,    // default: false
    transparent: true, // default: false
    resolution: 1       // default: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.loader
    .add("quadr", "https://cdn1.iconfinder.com/data/icons/gadgets-electronics-and-hardware-1/24/_drone-128.png")
    // .add("quadr", "https://c7.hotpng.com/preview/753/423/691/brown-rat-rodent-rats-and-mice-mouse-squirrel-mouse-thumbnail.jpg")
    .on("progress", loadProgressHandler)
    .load(setup);

function loadProgressHandler(loader, resource) {

    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url);

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%");

    //If you gave your files names as the first argument
    //of the `add` method, you can access them like this
    //console.log("loading: " + resource.name);
}

let state,
    time = 0;
let fixedObjects = [],
    quadros = [];

let scenario = 4;
switch (scenario) {
    case 1:
        quadros = [
            new Quadro("1a", 500, 100),
            new Quadro("2a", 500, 200),
            new Quadro("3a", 150, 150),
            // new Quadro("4a", 200, 200)
        ];
        // quadros[0].setTargetPosition(400, 400);
        // quadros[1].setTargetPosition(800, 200);
        quadros[2].setTargetPosition(700, 150);
        quadros[2].setTaskForNotification("123");
        // quadros[3].setTargetPosition(0, 300);
        break;
    case 2:
        quadros = [
            new Quadro("1a", 200, 200),
            new Quadro("2a", 220, 100),
            new Quadro("3a", 370, 170)
        ];
        quadros[0].setTargetPosition(490, 200);
        quadros[1].setTargetPosition(490, 100);
        break;
    case 3:
        quadros = [
            new Quadro("1a", 200, 200),
            new Quadro("2a", 220, 100),
            new Quadro("3a", 370, 170)
        ];
        quadros[0].setTargetPosition(490, 200);
        quadros[1].setTargetPosition(250, 300);
        break;
    case 4:
        //normal working scale 0.2
        quadros = [
            new Quadro("1a", 50, 50, 0.2),
            new Quadro("2a", 50, 110, 0.2),
            new Quadro("3a", 50, 170, 0.2),
            new Quadro("4a", 50, 230, 0.2),
            new Quadro("5a", 50, 290, 0.2),
            new Quadro("6a", 140, 50, 0.2),
            new Quadro("7a", 140, 110, 0.2),
            new Quadro("8a", 140, 170, 0.2),
            new Quadro("9a", 140, 230, 0.2),
            new Quadro("10a", 140, 290, 0.2)
        ];
        // quadros.forEach(q => q.setTargetPosition(490, 200));
        // quadros[2].someCommand();
        // quadros[quadros.length - 1].setTaskForNotification(JSON.stringify({
        //     id: 228,
        //     action: "move",
        //     to: {
        //         x: 350,
        //         y: 300
        //     }
        //
        // }));
        break;
}

//This `setup` function will run when the image has loaded
function setup(loader, resources) {

    quadros.forEach(quad => {
        quad.initQuadro(new PIXI.Sprite(resources["quadr"].texture), quadros);
        app.stage.addChild(...quad.getPixiObjects());
    });

    // drawLine(0, 0, 200, 3);

    // app.renderer.render(app.stage);

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function play(delta) {
    time++;
    quadros.forEach(quad => quad.doStep());
}

function stop() {

}

let el = document.createElement("input");
el.type = "checkbox";
el.id = "check_stop";
el.addEventListener("click", function () {
    if (this.checked) {
        state = stop;
    } else {
        state = play;
    }
});
document.body.appendChild(el);

el = document.createElement("input");
el.type = "button";
el.title = "Add task";
el.id = "add_task";
el.addEventListener("click", function () {
    // quadros.forEach(quad => quad.safeRadius += 10);
    quadros[quadros.length - 1].setTaskForNotification(JSON.stringify({
        id: 228,
        action: "move",
        to: {
            x: 500,
            y: 200
        }

    }))
});
document.body.appendChild(el);
