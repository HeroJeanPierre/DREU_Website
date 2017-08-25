var originalPoints = [];
var newPoints = [];

var originalCentroid;
var newCentroid;

var translation;
var rotation;


var box = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
var rotateOnBool = false;
var theta = 0;
var finalized = false;
var ifRunICP = false;
var showNearestBool = false;
// This will be a 2 dim array with the 2 indices of the closest points.
var closestPoints = [];




function setup() {
	// 90% Width
		var canvas = createCanvas(window.innerWidth * 0.9, 800);
	canvas.parent("icp_canvas_1");

	background(12, 12, 12);
	frameRate(60);

	box = {
		minX: width,
		maxX: 0,
		minY: height,
		maxY: 0
	};
}

function rotateOn() {
	rotateOnBool = !rotateOnBool;
}

function showNearest(){
	showNearestBool = !showNearestBool;
}




function runICPSwitch(){
	ifRunICP = !ifRunICP;
}

function draw() {
	console.log(newPoints)
	background(12, 12, 12);
	blueGrid();
	/*Translate Start*/
	var xShift = document.getElementById("xRange").value;
	xShift *= 3;

	var yShift = document.getElementById("yRange").value;
	yShift *= 3;

	if(finalized == false){

		for (var i = 0; i < originalPoints.length; i++) {
			newPoints[i] = originalPoints[i].splice();
		}
	}

	for (var i = 0; i < originalPoints.length; i++) {
		newPoints[i][0] = originalPoints[i][0] + xShift;
		newPoints[i][1] = originalPoints[i][1] + yShift;
	}
	/*Translate End!*/

	/*Rotate Start*/
	if(originalPoints.length > 2){
		/*Rotate Start*/
		if (rotateOnBool) {
			// tinyRotate();
			theta += .001;
		}
		var sumX = 0;
		var sumY = 0;

		for (var i = 0; i < newPoints.length; i++) {
			sumX += newPoints[i][0];
			sumY += newPoints[i][1];
		}

		sumY /= newPoints.length;
		sumX /= newPoints.length;

		var absCenter = { x: sumX, y: sumY };

		var rotationMatrix = [
		[Math.cos(theta), -Math.sin(theta)],
		[Math.sin(theta), Math.cos(theta)]
		];

		for (var i = 0; i < newPoints.length; i++) {
			newPoints[i][0] -= absCenter.x;
			newPoints[i][1] -= absCenter.y;
		}

		newPoints = numeric.dot(newPoints, rotationMatrix);

		for (var i = 0; i < newPoints.length; i++) {
			newPoints[i][0] += absCenter.x;
			newPoints[i][1] += absCenter.y;
		}

		/*Rotate End*/
	}

	drawOriginalPoints();
	drawNewPoints();

	if(showNearestBool){
		drawConnectingLines();
	}

	if(ifRunICP){
		runICP();
	}

	if (originalPoints.length > 2) {
		drawBoundingBox();
	}
	centroids();
	displayValues();
}


function displayValues() {
	fill(200, 20, 0);
	textSize(20);

	var angle = theta % (2 * PI);
	textAlign(LEFT);
	text("Center Position: (" + originalCentroid.x.toString() + ", " + originalCentroid.y.toString() + ")", 5, 50);
	// text("Translation X: " + document.getElementById("xRange").value.toString(), 5, 100);
	// text("Translation Y: " + document.getElementById("yRange").value.toString(), 5, 150);
	// text("Rotation: " + angle.toString() + " Radians", 5, 200);

	fill(100, 100, 0);
	textSize(20);
	
	translation = {x: newCentroid.x - originalCentroid.x, y: newCentroid.y - originalCentroid.y};


	textAlign(RIGHT);
	text("New Center Position: (" + newCentroid.x.toString() + ", " + newCentroid.y.toString() + ")", width - 5, 50);
	// text("Centroid X Translation: " + translation.x.toString(), width - 5,100);
	// text("Centroid Y Translation: " + translation.y.toString(), width - 5,150);
	// text("Rotation: ", width - 5, 200);
}

function blueGrid() {
	for (var i = 0; i < height; i += 20) {
		stroke(0, 90, 90, 50);
		line(0, i, width, i);
	}

	for (var i = 0; i < width; i += 20) {
		line(i, 0, i, height);
	}
}

function mouseClicked() {
	if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
		originalPoints.push([mouseX, mouseY]);
	}
	// console.log(originalPoints);
}

function centroids() {
	var sumX = 0;
	var sumY = 0;

	for (var i = 0; i < originalPoints.length; i++) {
		sumX += originalPoints[i][0];
		sumY += originalPoints[i][1];
	}

	sumY /= originalPoints.length;
	sumX /= originalPoints.length;

	originalCentroid = {x: sumX, y: sumY };

	// Transform
	fill(200, 20, 0, 90);
	noStroke();
	text("Center", originalCentroid.x, originalCentroid.y - 10);
	ellipse(originalCentroid.x, originalCentroid.y, 8, 8);

	sumX = 0;
	sumY = 0;

	for (var i = 0; i < newPoints.length; i++) {
		sumX += newPoints[i][0];
		sumY += newPoints[i][1];
	}

	sumY /= newPoints.length;
	sumX /= newPoints.length;

	newCentroid = {x: sumX, y: sumY };


	// Transform
	fill(0, 233, 0);
	noStroke();
	text("Center", newCentroid.x, newCentroid.y - 10);
	ellipse(newCentroid.x, newCentroid.y, 8, 8);
}

function drawNewPoints() {
	noStroke();

	fill(200, 200, 200);

	for (var i = 0; i < newPoints.length; i++) {
		ellipse(newPoints[i][0], newPoints[i][1], 5, 5);
	}
}

function drawOriginalPoints() {

	noStroke();

	fill(250, 0, 0, 100);

	for (var i = 0; i < originalPoints.length; i++) {
		ellipse(originalPoints[i][0], originalPoints[i][1], 5, 5);
	}
}

function drawBoundingBox() {
	var currentX = 0;
	var currentY = 0;
	box.maxY = 0;
	box.maxX = 0;
	box.minY = height;
	box.minX = width;

	for (var i = 0; i < newPoints.length; i++) {
		currentX = newPoints[i][0];
		currentY = newPoints[i][1];

		if (box.maxX < currentX) {
			box.maxX = currentX;
		}

		if (box.minX > currentX) {
			box.minX = currentX;
		}

		if (box.maxY < currentY) {
			box.maxY = currentY;
		}

		if (box.minY > currentY) {
			box.minY = currentY;
		}
	}

	stroke(255, 0, 0);
	noFill();

	rect(box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY);
}

function drawConnectingLines(){
	stroke(20, 200, 0, 190);
	for(var i = 0; i < originalPoints.length; i++){
		line(originalPoints[i][0], originalPoints[i][1],newPoints[i][0], newPoints[i][1]);
	}

	// Connect centers
	stroke(0, 0, 190)
	line(originalCentroid.x, originalCentroid.y, newCentroid.x, newCentroid.y);
}

function finalize(){
	finalized = true;
}

function runICP(){
	nearestNeighbor();
	nearestNeighborConnectors();
}

function nearestNeighbor(){
	closestPoints = [];
	for(var i = 0; i < newPoints.length; i++){
		var nearest = width;
		var current = 0;
		closestPoints.push(i);
		for(var j = 0; j < originalPoints.length; j++){
			current = Math.sqrt(Math.pow(newPoints[i][0] - originalPoints[j][0], 2) + Math.pow(newPoints[i][1] - originalPoints[j][1], 2));
			if(nearest > current){
				nearest = current;
				closestPoints[i] = j
			}
		}
	}
}

function nearestNeighborConnectors(){
	console.log("Displaying connections...")
	fill(0, 0, 255);
	stroke(0, 0, 255);

	for(var i = 0; i < closestPoints.length; i++){
		line(newPoints[i][0], newPoints[i][1], originalPoints[closestPoints[i]][0], originalPoints[closestPoints[i]][1]);
		console.log(newPoints[i][0], " : ", newPoints[i][1]);
		console.log(originalPoints[closestPoints[i]][0], " : ", originalPoints[closestPoints[i]][1]);
	}
}


function showICP(){
	translation = {x: newCentroid.x - originalCentroid.x, y: newCentroid.y - originalCentroid.y};

	document.getElementById("translation").innerHTML = "Predicted Translation Offset: " + Math.ceil(translation.x).toString() + ", " + Math.ceil(translation.y).toString()
	var deg = theta * (180/PI);
	document.getElementById("rotation").innerHTML = "Predicted Rotation Offset(deg): " + deg.toString();

}