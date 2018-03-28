var canvas;
var ctx;

var canvas_magnification = 25;
var canvas_width  = 41; 
var canvas_height = 41;    
var startPoint = {x:0,y:0};

var isLineRemove = false;
var isLineNull = true;

///// 内部関数

function toroot() {
	location.reload();
}

$(window).on('beforeunload', function() {
	location.reload();
});

function init_canvas(){
	ctx.fillStyle = "rgb(255, 255, 255)";  
	ctx.fillRect(0,0,canvas.width,canvas.height);
	document.getElementById("number_form").value = null;
	document.getElementById("distance_form").value = null;
	num_form.centercheck.checked = false;
	num_form.check.checked = false;
	drawRule();  
}

function drawRule(){
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 2;
	ctx.beginPath();

  // 縦線
  for (var i = 0; i < canvas_width+1; i++) {
  	ctx.moveTo((i*canvas_magnification),0);
  	ctx.lineTo((i*canvas_magnification),canvas.height);
  }

  // 横線
  for (var i = 0; i < canvas_height+1; i++) {
  	ctx.moveTo(0,(i*canvas_magnification));
  	ctx.lineTo(canvas.height,(i*canvas_magnification));
  }

  ctx.stroke();  
}

function numchange(){
	var ischeck = num_form.check.checked;
	var iscentercheck = num_form.centercheck.checked;
	var number = document.getElementById("number_form").value;
	var distance_number = document.getElementById("distance_form").value;

	isLineNull = false;

	if(ischeck == true){
		isLineRemove = false;
	}else{
		isLineRemove = true;
	}

	if(iscentercheck == true) {
		startPoint.x = Math.floor(canvas_width/2);
		startPoint.y = Math.floor(canvas_width/2);
	}else{
		startPoint.x = 0;
		startPoint.y = 0;
		if(number != null) {
			number = 90;
			document.getElementById("number_form").value = 90;
		}
	}

	if(distance_number > 100) {
		distance_number = 100;
		document.getElementById("distance_form").value = 100;
	}


	if(number !== null) {
		getPointByDistanceAndDegree(distance_number, number);
	}
}

function getPointByDistanceAndDegree(distance, degree){
	count = 0;

	if(isLineRemove == true) {
		$("td").removeClass("line");
	}
	var x2 = startPoint.x + distance * Math.cos( degree * (Math.PI / 180) );
	var y2 = startPoint.y + distance * Math.sin( degree * (Math.PI / 180) );

	console.log(x2);
	console.log(y2);

	drawline(startPoint.x,startPoint.y,x2,y2);
}

///// イベント

window.onload = function (){
	canvas = document.getElementById("MyCanvas");

	canvas.width  = canvas_width * canvas_magnification;
	canvas.height = canvas_height * canvas_magnification;    

	ctx = canvas.getContext("2d");

	init_canvas();              
}

var drawline = function(x0,y0,x1,y1){
	var iscentercheck = num_form.centercheck.checked;

	if (isLineRemove == true) {
		ctx.fillStyle = "rgb(255, 255, 255)";  
		ctx.fillRect(0,0,canvas.width,canvas.height);
	}
	if (iscentercheck == true) {
		$("#20-20").css({'background-color':'#ffe900'});
	}
	var tmp;
	var steep = Math.abs(y1-y0) > Math.abs(x1-x0);
	if(steep){
	    //swap x0,y0
	    tmp=x0; x0=y0; y0=tmp;
	    //swap x1,y1
	    tmp=x1; x1=y1; y1=tmp;
	}

	var sign = 1;
	if(x0>x1){
		sign = -1;
		x0 *= -1;
		x1 *= -1;
	}
	var dx = x1-x0;
	var dy = Math.abs(y1-y0);
	var err = ((dx/2));
	var ystep = y0 < y1 ? 1:-1;
	var y = y0;

	for(var x=x0;x<=x1;x++){
		if(!(steep ? plot(y,sign*x) : plot(sign*x,y))) return;
		err = (err - dy);
		if(err < 0){
			y+=ystep;
			err+=dx;
		}
	}
}


var plot = function(x,y){
	var col = Math.floor(x);
	var row = Math.floor(y);

	ctx.fillStyle = "rgb(200, 0, 0)";  
	ctx.fillRect(col * canvas_magnification, row * canvas_magnification,
		canvas_magnification, canvas_magnification);

  drawRule(col * canvas_magnification);

  return true;
}