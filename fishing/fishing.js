/* Grady Landers
 * Fishing game (possibly inspired by club penguin)
 */

//server variables
const API = 'http://gradxl49.pythonanywhere.com/';

//general variables
var canvas;
var canvas_ctx;
var hookx;
var hooky;
var hooked = false;
var hookimg = new Image();
hookimg.src = "./resources/hook.png";
var score = 0;
var worms = 3;
var wormimg = new Image();
wormimg.src = "./resources/worm.png";
var leaderboard;

fetch(API+'/getscores', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(data => {
	leaderboard = data;
	initialize();
})
.catch(e => console.error(e));

// var highs = [];
// var names = [];
// if(localStorage.numhighs) {
// 	loadData();
// }

//fish variables
var fish = [];
var fi;
var on = -1;
var fw = 50;
var fh = 30;
var fs = 0.3;
var spawnRate = 2500;
var fishr = new Image();
fishr.src = "./resources/fishr.png";
var fishl = new Image();
fishl.src = "./resources/fishl.png";
var bigguy = false;
var bx=0-fw*2, by, bd=false;
var bigr = new Image();
bigr.src = "./resources/bigr.png";
var bigl = new Image();
bigl.src = "./resources/bigl.png";

//obstacle variables
var obstacles = [];
var ow = 40;
var oh = 50;
var os = 0.3;
var oi;
var obstacle = new Image();
obstacle.src = "./resources/barrel.png";

//initialize stuff once the page starts
function initialize() {
	captureIP();
	
	document.getElementById("score").innerHTML = score;
	document.getElementById("text").hidden = true;
	canvas = document.getElementById("gameCanvas");
	canvas_ctx = canvas.getContext("2d");
	by = canvas.width/2-fh;
	
	var id = "top"
	for(let i=0; i<10 && i<leaderboard.length; i++) {
		var txt = leaderboard[i].name + " " + leaderboard[i].score;
		document.getElementById(id+i).innerHTML = txt;
	}
	
	by = canvas.width/2 - fh;
	hookx = canvas.width/2;
	canvas.addEventListener('mousemove', moveHook);
	canvas.addEventListener('click', buttons);
	menu();
}

//show the menu
function menu() {
	clearCanvas();
	
	//draw start snd indtructions buttons
	canvas_ctx.fillStyle = "#ff5e00";
	canvas_ctx.strokeStyle = "#292929";
	canvas_ctx.fillRect(canvas.width/2-75, canvas.height*0.3, 150, 75);
	canvas_ctx.strokeRect(canvas.width/2-75, canvas.height*0.3, 150, 75);
	
	canvas_ctx.fillRect(canvas.width/2-75, canvas.height*0.5, 150, 75);
	canvas_ctx.strokeRect(canvas.width/2-75, canvas.height*0.5, 150, 75);
	
	canvas_ctx.font = "30px Comic Sans MS";
	canvas_ctx.textAlign = "center";
	canvas_ctx.fillStyle = "#292929";
	canvas_ctx.fillText("Start", canvas.width/2, canvas.height*0.4);
	canvas_ctx.fillText("Rules", canvas.width/2, canvas.height*0.6);
}

//menu button functionality
function buttons(event) {
	if(event.clientX > canvas.width/2-75 && event.clientX < canvas.width/2+75) {
		if(event.clientY > canvas.height*0.3 && event.clientY < canvas.height*0.3+75) {
			//start the game
			document.getElementById("text").hidden = false;
			canvas.removeEventListener('click', buttons);
			canvas.addEventListener('click', release);
			main();
			fi = setInterval(newFish, spawnRate);
		}
		else if(event.clientY > canvas.height*0.5 && event.clientY < canvas.height*0.5+75) {
			rules()
		}
		else if(event.clientY > canvas.height*0.9 && event.clientY < canvas.height*0.9+30) {
			menu();
		}
	}
}

//show the instructions
function rules() {
	clearCanvas();
	
	//text
	canvas_ctx.font = "20px Comic Sans MS";
	canvas_ctx.fillStyle = "#292929";
	canvas_ctx.fillText("Use the mouse to move the hook up and down.", canvas.width/2, canvas.height*0.2);
	canvas_ctx.fillText("Click to release a fish once hooked.", canvas.width/2, canvas.height*0.3);
	canvas_ctx.fillText("Release above the line to get a point.", canvas.width/2, canvas.height*0.4);
	canvas_ctx.fillText("Releasing below the line or getting hit by a barrel", canvas.width/2, canvas.height*0.5);
	canvas_ctx.fillText("while hooked will lose the fish and a worm.", canvas.width/2, canvas.height*0.55);
	canvas_ctx.fillText("Lose all three worms and lose the game.", canvas.width/2, canvas.height*0.65);
	canvas_ctx.fillText("When you're happy with your score, enter your name", canvas.width/2, canvas.height*0.75);
	canvas_ctx.fillText("in the textbox and press submit to get on the", canvas.width/2, canvas.height*0.8);
	canvas_ctx.fillText("leaderboard, but only the top 10 are shown!", canvas.width/2, canvas.height*0.85);
	
	
	//back button
	canvas_ctx.font = "30px Comic Sans MS";
	canvas_ctx.fillStyle = "#ff5e00";
	canvas_ctx.strokeStyle = "#292929";
	canvas_ctx.fillRect(canvas.width/2-50, canvas.height*0.9, 100, 30);
	canvas_ctx.strokeRect(canvas.width/2-50, canvas.height*0.9, 100, 30);
	canvas_ctx.fillStyle = "#292929";
	canvas_ctx.fillText("Back", canvas.width/2, canvas.height*0.95);
}

//do the game
function main() {
	setTimeout(function onTick() { //run every millisecond
		//reset background
		clearCanvas();
		
		//check lose state
		if(worms <= 0) {
			clearInterval(fi);
			hooky = 0;
			canvas_ctx.fillStyle = "red";
			canvas_ctx.font = "30px Comic Sans MS";
			canvas_ctx.textAlign = "center";
			canvas_ctx.fillText("Game Over", canvas.width/2, canvas.height/2);
		}
		else{
			drawWorms();
			drawHook();
		}
		
		//handle the pieces
		fish.forEach(moveFish);
		fish.forEach(hook);
		fish.forEach(drawFish);
		obstacles.forEach(moveObstacle);
		obstacles.forEach(checkObstacle);
		obstacles.forEach(drawObstacle);
		moveBig();
		checkBig();
		drawBig();
		
		//go again
		main();
	}, 1);
}

//make hook follow y position of mouse
function moveHook(event) {
	hooky = event.clientY - 77;
}

//draw remaining worms; aka lives
function drawWorms() {
	for(let i=0; i<worms; i++) {
		canvas_ctx.drawImage(wormimg, 10+(i*25), 10, 20, 10);
	}
}

//draw the hook
function drawHook() {
	canvas_ctx.drawImage(hookimg, hookx-5, hooky, 10, 20);
	canvas_ctx.strokeStyle = 'darkgray';
	canvas_ctx.strokeRect(hookx, 0, 0, hooky);
}

//give me random numbers
function rng(min, max) {
	return Math.round((Math.random() * (max-min) + min) / 10) * 10;
}

//generate another fish
function newFish() {
	const fy = rng(canvas.height*0.1+10, canvas.height-fh-10);
	var fx;
	const right = rng(0, 10) === 0;
	if(right) {
		fx = 0 - fw;
	}
	else {
		fx = canvas.width;
	}
	
	fish.push({x:fx, y:fy, d:right, h:false});
}

//generate another obstacle
function newObstacle() {
	if(obstacles.length === 10) {
		clearInterval(oi);
		return;
	}
	
	const oy = rng(canvas.height*0.2, canvas.height*0.8);
	var ox;
	const right = rng(0, 10) === 0;
	if(right) {
		ox = 0 - ow;
	}
	else {
		ox = canvas.width;
	}
	
	obstacles.push({x:ox, y:oy, d:right, h:false});
}

//reset orientation of big fish
function resetBig() {
	bd = !bd;
	by = canvas.width/2 - fh;
	if(bd) bx = 0-fw*2-canvas.width*2;
	else bx = canvas.width*3;
}

//change position of a fish
function moveFish(f) {
	if(!f.h) {
		if(f.d) {
			f.x += fs;
		}
		else {
			f.x -= fs;
		}
	}
	else {
		f.y = hooky;
	}
}

//move the big fish
function moveBig() {
	if(bigguy) by = hooky-fh+10;
	else if(bd) bx += 0.2;
	else bx -= 0.2;
	
	//console.log(bx);
}

//change position of an obstacle
function moveObstacle(o) {
	if(o.d) {
		if(o.x > canvas.width){
			o.x = rng(0-ow, 0-canvas.width*5);
			o.y = rng(canvas.height*0.2, canvas.height*0.8);
		}
		o.x += os;
	}
	else {
		if(o.x < 0-ow){
			o.x = rng(canvas.width, canvas.width*6);
			o.y = rng(canvas.height*0.2, canvas.height*0.8);
		}
		o.x -= os;
	}
}

//draw a fish
function drawFish(f) {
	if(f.h && bigguy) ;
	else if(f.d) canvas_ctx.drawImage(fishr, f.x, f.y, fw, fh);
	else canvas_ctx.drawImage(fishl, f.x, f.y, fw, fh);
}

//draw an obstacle
function drawObstacle(o) {
	canvas_ctx.drawImage(obstacle, o.x, o.y, ow, oh);
}

//draw big fish
function drawBig() {
	canvas_ctx.fillStyle = 'red';
	canvas_ctx.strokeStyle = 'darkred';
	if(bd) canvas_ctx.drawImage(bigr, bx, by, fw*2, fh*2);
	else canvas_ctx.drawImage(bigl, bx, by, fw*2, fh*2);
}

//check if a fish has been hooked
function hook(f) {
	if(!hooked) {
		if(f.d && (hooky+10>f.y && hooky<f.y+fh) && Math.abs(canvas.width/2 - (f.x+fw)) < 5) {
			f.h = true;
			hooked = true;
			on = fish.indexOf(f);
			f.x = hookx - fw;
		}
		else if(!f.d && (hooky+10>f.y && hooky<f.y+fh) && Math.abs(canvas.width/2 - f.x) < 5) {
			f.h = true;
			hooked = true;
			on = fish.indexOf(f);
			f.x = hookx;
		}
	}
}

//check if an obstacle hits a hooked fish
function checkObstacle(o) {
	if(!o.h) {
		if(hooked && hookx > o.x && hookx < o.x+ow && hooky > o.y && hooky < o.y+oh) {
			o.h = true;
			hooked = false;
			fish[on].h = false;
			if(fish[on].d) fish[on].x += 10;
			else fish[on].x -= 10;
			
			if(bigguy){
				bigguy = false;
				setTimeout(resetBig, 20000);
			}
			
			worms--;
		}
	}
	else {
		if(o.d && hookx < o.x) {
			o.h = false;
		}
		else if(!o.d && hookx > o.x+ow) {
			o.h = false;
		}
	}
}

function checkBig() {
	if(hooked) {
		if(bd && (hooky+10>by && hooky<by+fh*2) && Math.abs(canvas.width/2 - (bx+fw*2)) < 5) {
			bigguy = true;
			bx = hookx - fw*2;
		}
		else if(!bd && (hooky+10>by && hooky<by+fh*2) && Math.abs(canvas.width/2 - bx) < 5) {
			bigguy = true;
			bx = hookx;
		}
	}
}

//release the fish when the player clicks
function release(event) {
	if(hooked) {
		if(hooky < canvas.height*0.1) {
			if(fish[on].d) {
				fish[on].x = 0-fw-rng(canvas.width, canvas.width*5);
			}
			else {
				fish[on].x = rng(canvas.width, canvas.width*5);
			}
			fish[on].y = rng(canvas.height*0.1+10, canvas.height-fh-10);
			fish[on].h = false;
			
			if(bigguy) {
				if(bd) bx = canvas.width;
				else bx = 0-fw*2;
				bigguy = false;
				resetBig();
				score += 10;
			}
			else score++;
			
			hooked = false;
			document.getElementById("score").innerHTML = score;
			if(score<=30 && score%5===0) {
				if(score === 10) oi = setInterval(newObstacle, 7500);
				else if(score === 15) resetBig();
				fs *= 1.1;
			}
			else if(score%10 === 0) {
				fs *= 1.05;
			}
		}
		else {
			fish[on].h = false;
			if(fish[on].d) fish[on].x += 10;
			else fish[on].x -= 10;
			
			if(bigguy) {
				bigguy = false;
				setTimeout(resetBig, 20000);
			}
			
			hooked = false;
			worms--;
		}
	}
}

//reset the background
function clearCanvas() {
	canvas_ctx.fillStyle = 'lightblue';
	canvas_ctx.strokeStyle = 'black';
	canvas_ctx.fillRect(0, 0, canvas.width, canvas.height);
	canvas_ctx.strokeRect(0, 0, canvas.width, canvas.height);
	canvas_ctx.strokeRect(0, canvas.height*0.1, canvas.width, canvas.height);
}

function addScore() {
	if(score < 1) {
		alert('You must get a score to get on the leaderboard!');
		return;
	}

	var name = document.getElementById('name').value;
	if(name == '') {
		alert('You must enter a name to put your score on the leaderboard!')
		return;
	}

	fetch(API+'/sendscore', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({name: name, score: score})
	})
	.then(response => response.json())
	.then(data => {
		location.reload();
	})
	.catch(e => console.error(e));
}

function getScores() {
	var value;
	
	fetch(API+'/getscores', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(response => response.json())
	.then(data => {
		console.log(data);
		value = data;
	})
	.catch(e => console.error(e));

	return value;
}

/* Deprecated Scoring functions */
//add high score
// function addScore() {
// 	var added = false;
// 	var name = document.getElementById('name').value;
	
// 	if(highs.length === 0) {
// 		highs[0] = score;
// 		names.push(String(name));
// 		added = true;
// 	}
// 	else {
// 		for(let i=0; i<highs.length; i++) {
// 			if(score > highs[i]) {
// 				highs.splice(i, 0, score);
// 				names.splice(i, 0, name);
// 				added = true;
// 				break;
// 			}
// 		}
// 	}
	
// 	if(!added) {
// 		highs.push(score);
// 		names.push(name);
// 	}
	
// 	while(highs.length > 10) {
// 		highs.pop();
// 		names.pop();
// 	}
	
// 	saveData();
// 	location.reload();
// 	console.log(highs);
// 	console.log(names);
// }

//dynamically save and load arrays of data for the scoreboard
// function saveData() {
// 	const highstr = "highs";
// 	const namestr = "names";
	
// 	localStorage.setItem("numhighs", highs.length);
	
// 	for(let i=0; i<highs.length; i++) {
// 		localStorage.setItem(highstr+i, highs[i]);
// 		localStorage.setItem(namestr+i, names[i]);
// 	}
// }

// function loadData() {
// 	const numhighs = localStorage.getItem("numhighs");
// 	const highstr = "highs";
// 	const namestr = "names";
	
// 	for(let i=0; i<numhighs; i++) {
// 		highs[i] = localStorage.getItem(highstr+i);
// 		names[i] = localStorage.getItem(namestr+i);
// 	}
// }

//reset for dev purposes
// function ResetStorage() {
// 	localStorage.clear();
// 	location.reload();
// }

//set score for dev purposes
// function SetScore(value) {
// 	score = value;
// }

//capture the user's IP
function captureIP() {
	fetch('https://api.ipify.org?format=json')
	.then(response => {return response.json()})
	.then(json => {
		var ip = json.ip;
		//console.log('your ip: ', ip)
		fetch(API+'/connect', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ip: ip})
		})
		.then(response => response.json())
		.then(data => {
			//handle the response
		})
		.catch(e => console.error(e));
	})
	.catch(e => console.error(e));
}
