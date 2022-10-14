var particles = [];
var cx,cy;

var numOfParticles = 600; // 需要调整这个星体个数


var zoom=0.4;
var offset={'x':0,'y':0};

var Mass = 10;
var Walls = true;
var Collision = false;
var Kill = true;

function clearAll() {
	particles=[];
}

// function setup() {
// 	createCanvas(windowWidth, windowHeight);
// 	cx=windowWidth/2;
// 	cy=windowHeight/2;
// 	stroke(255);
// 	for (var i = numOfParticles; i >= 0; i--) {
// 		var p=new Particle(random(windowWidth/zoom),random(windowHeight/zoom),0,0,0,0,random(30,40),1);
// 		particles.push(p);
// 	}
// }

function setup() {
	createCanvas(windowWidth, windowHeight);
	cx=windowWidth/2;
	cy=windowHeight/2;
	stroke(255);
	let x = windowWidth/2;
	let y = windowHeight/2;
	for (var i = numOfParticles; i >= 0; i--) {
		let k = i/numOfParticles;
		var p=new Particle(x+x*Math.cos(2*PI*k),y+y*Math.sin(2*PI*k),0,0,0,0,random(20,30),1);
		particles.push(p);
	}
}
function draw() {
	background(0,40,100);
	push();
	scale(zoom);
	translate(offset.x,offset.y);
	endx = windowWidth/zoom;
	endy = windowHeight/zoom;
	xl = Math.ceil(endx/len);
	yl = Math.ceil(endy/len);	
	let a = new Date().getTime();
	addg();
	let b = new Date().getTime();
	calcNewton(); // 主要是这个计算耗时
	let c = new Date().getTime();
	
	for (var i = particles.length - 1; i >= 0; i--) {
		particles[i].render();
		particles[i].update();
	}
	pop();
	textSize(12);
	fill(255);
	text('Frame Rate: ' + frameRate().toFixed(0) + ' Particles:' + particles.length,20,windowHeight-20);
}

var len =180;
class Particle {
	constructor(x,y,vx,vy,ax,ay,mass){
		this.x=x; // x 坐标
		this.y=y; // y 坐标
		this.vx=vx; // x 轴速度
		this.vy=vy; // y 轴速度
		this.ax=ax; // x 轴加速度
		this.ay=ay; // y 轴加速度
		this.mass=mass; // 质量
		this.r=Math.log(Math.abs(mass)); // 半径
		this.myColor=color(255,255,255,12+Math.log(this.mass)*8);	
	}

	render(){
		fill(this.myColor);
		stroke(this.myColor)
		ellipse(this.x,this.y,this.r*4);
	}

	updateAcc(ax,ay) {
		this.ax=ax*0.5;
		this.ay=ay*0.5;
	}; 

	update() {
		this.vx+=this.ax/2;
		this.vy+=this.ay/2;
		this.ax = 0;
		this.ay = 0;
		this.x+=this.vx;
		this.y+=this.vy;
		this.myColor=color(255,255,255,12+Math.log(this.mass)*8);	
	}; 
}

//
var g;
var xl, yl;
var endx;
var endy;

function addg(){
	g = new Array();
	for(let i = 0; i<xl; i++){
		g[i] = new Array();
		for(let j = 0; j<yl; j++){
			g[i][j] = new Array();
		}
	}
	for(let i = 0; i<particles.length; ){
		let p = particles[i];
		if(Kill && (p.x<0 || p.y<0||p.x>endx || p.y>endy))  particles.splice(i,1);
		else {
			let s = g[Math.floor(p.x/len)][Math.floor(p.y/len)];
			s.push(p);
			i++;
		}
	}
}
function ex(a, t, index){
	if(t == undefined)return;
	for(let i = index; i<t.length; i++){
		let b = t[i];
		let d = dist(a.x,a.y,b.x,b.y), td;
		if(d < 8) td = 512;
		else td = d*d*d;
		let dx = (b.x-a.x)/td;
		let dy = (b.y-a.y)/td;
		a.ax += b.mass*dx;
		a.ay += b.mass*dy;
		b.ax -= a.mass*dx;
		b.ay -= a.mass*dy;
	}
}
function grid(x, y){
	if(x >= 0 && y >=0 && x < xl && y < yl)return g[x][y];
	return undefined;
}
function calcNewton() {
	for(let x = 0; x<xl; x++){
		for(let y = 0; y<yl; y++){
			let t = g[x][y];
			for(let i = 0; i<t.length; i++){
				let a=t[i];
				ex(a, t, i+1);
				ex(a, grid(x+1, y), 0);
				ex(a, grid(x+1, y+1), 0);
				ex(a, grid(x, y+1), 0);
				ex(a, grid(x-1, y+1), 0);
				if(Walls){
					let r3=endx - a.x;
					let r4=endy - a.y;
					a.ax += 10000/(a.x*a.x);
					a.ay += 10000/(a.y*a.y);
					a.ax -= 10000/(r3*r3);
					a.ay -= 10000/(r4*r4);
				}
			}
		}	
	}
}