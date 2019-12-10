import * as PIXI from 'pixi.js';

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
    .add("kakash", "https://psv4.userapi.com/c856232/u318554322/docs/d15/df10ba7598b4/graffiti.png")
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

let ka1, ka2;
let state;
let fixedObjects = [],
    mobileObjects = [];

//This `setup` function will run when the image has loaded
function setup(loader, resources) {

    //Create the cat sprite
    ka1 = new PIXI.Sprite(resources["kakash"].texture);
    ka2 = new PIXI.Sprite(resources["kakash"].texture);


    ka1.x = 40;
    ka1.y = 10;

    ka2.x = 120;
    ka2.y = 10;

    // ka2.rotation = 0.5;
    //
    ka1.anchor.x = 0.1;
    ka1.anchor.y = 0.1;

    ka1.rotation = 0.5;

    ka2.vx = 1;

    let scale = 0.16;
    ka1.scale.set(scale, scale);
    ka2.scale.set(scale, scale);

    //Add the cat to the stage
    app.stage.addChild(ka1);
    app.stage.addChild(ka2);

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
    ka2.x += ka2.vx;
}
