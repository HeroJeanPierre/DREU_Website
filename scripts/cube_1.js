//RENDERER
var renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("canvas_1"),
	antialias: true,
	alpha: true
});

// renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(500, 300);

//CAMERA
// THREE.PerspectiveCamera( fov, aspect, near, far );
var camera = new THREE.PerspectiveCamera(
	35,
	window.innerWidth / window.innerHeight,
	0.1,
	5000
);

//SCENE
var scene = new THREE.Scene();

//LIGHTS

var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var light1 = new THREE.PointLight(0xffffff, 0.5);
scene.add(light1);

//OBJECT
var geometry = new THREE.CubeGeometry(300, 300, 300);
var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
var mesh = new THREE.Mesh(geometry, material);

/*It is important to */
mesh.position.set(0, 0, -1000);
scene.add(mesh);

//RENDER LOOP
requestAnimationFrame(render);
function render() {
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.01;
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}
