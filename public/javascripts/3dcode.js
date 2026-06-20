
let container;
let camera;
let controls;
let renderer;
let scene;
let mesh;
let objectRef;

function init() {
    container = document.querySelector( '#scene-container' );
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x8FD4BC );
    createCamera();
    createControls();
    createLights();
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath('../models/');
    objLoader.load('headmodel.obj', function (obj) {
        objectRef = obj;
        const mesh = obj.children[0];
        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        mesh.position.set(-center.x, -center.y, -center.z);
        const size = new THREE.Vector3();
        box.getSize(size);
        obj.rotation.set(0, 0, 0);
        scene.add(obj);
        createRenderer();
        // start the animation loop
        renderer.setAnimationLoop( () => {
            update();
            render();
        } );
    });
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(
        50, // FOV
        container.clientWidth / container.clientHeight, // aspect
        0.1, // near clipping plane
        1000, // far clipping plane
    );
    camera.position.set( 0, 0, 15 );
}

function createControls() {
    controls = new THREE.OrbitControls( camera, container );
    controls.maxPolarAngle = 8*Math.PI/10;
    controls.minPolarAngle = 2.5*Math.PI/10;
    controls.minAzimuthAngle = -5*Math.PI/10;
    controls.maxAzimuthAngle = 5*Math.PI/10;
}

function createLights() {
    const ambientLight = new THREE.HemisphereLight(
        0xddeeff, // sky color
        0x202020, // ground color
        2, // intensity
    );
    const mainLight = new THREE.DirectionalLight( 0xffffff, 5 );
    mainLight.position.set( 30, 30, 10 );
    scene.add( ambientLight, mainLight );
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;
    renderer.physicallyCorrectLights = true;
    container.appendChild( renderer.domElement );
}

function update() {

}


function render() {
    renderer.render( scene, camera );
}

// a function that will be called every time the window gets resized
function onWindowResize() {
    // set the aspect ratio to match the new browser window aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;
    // update the camera's frustum
    camera.updateProjectionMatrix();
    // update the size of the renderer AND the canvas
    renderer.setSize( container.clientWidth, container.clientHeight );

}
window.addEventListener( 'resize', onWindowResize );

// call the init function to set everything up
init();
