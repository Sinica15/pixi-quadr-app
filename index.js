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
    height: 256,        // default: 600
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
        new Quadro(90, 90, 0.2, 0),
        new Quadro(500, 90),
    ];

//This `setup` function will run when the image has loaded
function setup(loader, resources) {

    quadros.forEach(quad => {
        quad.initQuadro(new PIXI.Sprite(resources["quadr"].texture));
        app.stage.addChild(quad.getPixiObject());
    });

    app.renderer.render(app.stage);

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){

    //Update the current game state:
    state(delta);
}

function play(delta) {

    //Move the cat 1 pixel to the right each frame
    quadros.forEach(quad => quad.move());
}
