import * as PIXI from 'pixi.js';
import {Quadro} from "./quadro";


let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
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

let state;
let fixedObjects = [],
    quadros = [
        new Quadro("1a", 300, 100),
        new Quadro("2a", 700, 100),
        new Quadro("3a", 200, 200),
        new Quadro("4a", 200, 200),
    ];

//This `setup` function will run when the image has loaded
function setup(loader, resources) {

    quadros.forEach(quad => {
        quad.initQuadro(new PIXI.Sprite(resources["quadr"].texture));
        app.stage.addChild(quad.getLabelText());
        app.stage.addChild(quad.getDirectionVector());
        app.stage.addChild(quad.getPixiObject());
    });

    // drawLine(0, 0, 200, 3);

    quadros[0].setTargetPosition(400, 400);
    quadros[1].setTargetPosition(800, 200);
    quadros[2].setTargetPosition(400, 300);
    quadros[3].setTargetPosition(0, 300);

    // app.renderer.render(app.stage);

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){
    state(delta);
}

function play(delta) {
    quadros.forEach(quad => quad.move());
}

function stop() {

}

let el = document.createElement("input");
el.type = "checkbox";
el.id = "check_stop";
el.addEventListener("click",function() {
    if (this.checked) {
        state = stop;
    }else {
        state = play;
    }
});
document.body.appendChild(el);
