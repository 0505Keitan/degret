// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery3
//= require jquery.turbolinks
//= require popper
//= require bootstrap
//= require rails-ujs

let canvas;
let ctx;

let canvas_magnification = 25;
let canvas_width  = 41; 
let canvas_height = 41;    
let startPoint = {x:0,y:0};
let x2 = 0;
let y2 = 0;

let ellipsewidth = 41;
let ellipseheight = 41;

let isLineRemove = false;
let isLineNull = true;
let islinetab = true;
let iscircletab = false;
let ispolygontab = false;

///// 内部関数

$(window).on('beforeunload', function() {
	location.reload();
});

function init_canvas() {
	canvas_width  = 41; 
	canvas_height = 41; 
	canvas.width  = canvas_width * canvas_magnification;
	canvas.height = canvas_height * canvas_magnification;  
	ctx.fillStyle = "#363333";  
	ctx.fillRect(0,0,canvas.width,canvas.height);
	document.getElementById("grid_input_id").value = 41;
	document.getElementById("grid_output_id").value = 41;
	document.getElementById("radius_input_id").value = 20;
	document.getElementById("radius_output_id").value = 20;
	document.getElementById("ellipse_width_input_id").value = 41;
	document.getElementById("ellipse_width_output_id").value = 41;
	document.getElementById("ellipse_height_input_id").value = 41;
	document.getElementById("ellipse_height_output_id").value = 41;
	document.getElementById("number_form").value = null;
	document.getElementById("distance_form").value = null;
	num_form.centercheck.checked = false;
	num_form.check.checked = false;
	num_form.addcheck.checked = false;
	startPoint = {x:0,y:0};

	drawRule();  
}

function drawRule() {
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 2;
	ctx.beginPath();

  // 縦線
  for (var i = 0; i < canvas_width+1; i++) {
  	ctx.moveTo(canvas_magnification*i, 0);
  	ctx.lineTo(canvas_magnification*i, canvas.height);
  }

  // 横線
  for (var i = 0; i < canvas_height+1; i++) {
  	ctx.moveTo(0, canvas_magnification*i);
  	ctx.lineTo(canvas.width, canvas_magnification*i);
  }

  ctx.stroke();  
}

function numchange(){
	let number = document.getElementById("number_form").value;
	let distance_number = document.getElementById("distance_form").value;
	let radius_number = document.getElementById("radius_input_id").value;

	if(islinetab == true) {
		let ischeck = num_form.check.checked;
		let iscentercheck = num_form.centercheck.checked;
		let isaddcheck = num_form.addcheck.checked;

		if(ischeck == true){
			isLineRemove = false;
		}else{
			isLineRemove = true;
		}

		if(iscentercheck == true) {
			startPoint.x = Math.floor(canvas_width/2);
			startPoint.y = Math.floor(canvas_height/2);
			num_form.addcheck.checked = false;
			isaddcheck == false;
		}else{
			if(isaddcheck == true) {
				startPoint.x = x2;
				startPoint.y = y2;
				num_form.centercheck.checked = false;
				iscentercheck = false;
			} else {
				startPoint.x = 0;
				startPoint.y = 0;
			}
		}

		getPointByDistanceAndDegree(distance_number, number);

		isLineNull = false;

	} else if(iscircletab == true) {
		canvas_width = (radius_number * 2 + 1);
		canvas_height = (radius_number * 2 + 1);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;  
		drawRule();
		drawCircle(Math.floor(canvas_width/2), Math.floor(canvas_height/2), radius_number);
	} else if(ispolygontab == true) {
		let polygon_number = document.getElementById("polygon_input_id").value;
		let polygon_degree = document.getElementById("polygon_degree_form").value;
		let polygon_distance = document.getElementById("polygon_distance_form").value;
		let polygon_add_degree = 0;
		switch (polygon_number){
			case 1:
			polygon_add_degree = 60;
			break;
			case 2:
			polygon_add_degree = 90;
			break;
			case 3:
			polygon_add_degree = 108;
			break;
			case 4:
			polygon_add_degree = 120
			break;
			case 5:
			polygon_add_degree = 128.57;
			break;
			case 6:
			polygon_add_degree = 135;
			break;
			case 7:
			polygon_add_degree = 140;
			break;
			case 8:
			polygon_add_degree = 144;
			break;
		}
		let nowdegree = 0;
		for (var i = 0; i <= polygon_number + 2; i++) {
			if(i == 0) {
				startPoint.x = Math.floor(canvas_width/2);
				startPoint.y = Math.floor(canvas_height/2);
				num_form.centercheck.checked = false;
				iscentercheck = false;
				nowdegree = polygon_degree;
				getPointByDistanceAndDegree(polygon_distance, polygon_degree);
			}
			startPoint.x = x2;
			startPoint.y = y2;
			num_form.centercheck.checked = false;
			iscentercheck = false;
			let adddegree = nowdegree + 180 - polygon_add_degree;
			getPointByDistanceAndDegree(polygon_distance, adddegree);
		}
	}
}

$(window).ready(function(){
	$('#grid_input_id').on('change', function() {
		let gridval = $(this).val();
		canvas_width = (gridval);
		canvas_height = (gridval);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;
		document.getElementById("radius_input_id").value = Math.floor(gridval / 2);
		document.getElementById("radius_output_id").value = Math.floor(gridval / 2);
		drawRule();
	})
	$('#radius_input_id').on('change', function() {
		let val = $(this).val();
		canvas_width = (val * 2 + 1);
		canvas_height = (val * 2 + 1);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;
		document.getElementById("grid_input_id").value = Math.floor(val * 2) + 1;
		document.getElementById("grid_output_id").value = Math.floor(val * 2) + 1;  
		drawRule();
		drawCircle(Math.floor(canvas_width/2), Math.floor(canvas_height/2), val);
	})
	$('#ellipse_width_input_id').on('change', function() {
		ellipsewidth = $(this).val();
		canvas_width = (ellipsewidth * 2 + 1);
		canvas_height = (ellipseheight * 2 + 1);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;
		console.log(canvas_width);
		console.log(canvas_height);
		drawEllipse(Math.floor(canvas_width/2), Math.floor(canvas_height/2), ellipsewidth, ellipseheight);
		drawRule();
	})
	$('#ellipse_height_input_id').on('change', function() {
		ellipseheight = $(this).val();
		canvas_width = (ellipsewidth * 2 + 1);
		canvas_height = (ellipseheight * 2 + 1);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;
		console.log(canvas_width);
		console.log(canvas_height);
		drawEllipse(Math.floor(canvas_width/2), Math.floor(canvas_height/2), ellipsewidth, ellipseheight);
		drawRule();
	})
});

function getPointByDistanceAndDegree(distance, degree){
	count = 0;

	x2 = startPoint.x + distance * Math.cos( degree * (Math.PI / 180) );
	y2 = startPoint.y + distance * Math.sin( degree * (Math.PI / 180) );

	drawline(startPoint.x,startPoint.y,x2,y2);
}

var drawCircle = function (x0, y0, radius) {
	let x = Math.floor(radius);
	let y = Math.floor(0);
	let radiusError = 1 - x;
	ctx.fillStyle = "rgb(200, 0, 0)";

	while (x >= y) {

		ctx.fillRect(Math.abs(x + x0) * canvas_magnification, Math.abs(y + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(y + x0) * canvas_magnification, Math.abs(x + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(-x + x0) * canvas_magnification, Math.abs(y + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(-y + x0) * canvas_magnification, Math.abs(x + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(-x + x0) * canvas_magnification, Math.abs(-y + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(-y + x0) * canvas_magnification, Math.abs(-x + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(x + x0) * canvas_magnification, Math.abs(-y + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(y + x0) * canvas_magnification, Math.abs(-x + y0) * canvas_magnification,
			canvas_magnification, canvas_magnification);

		y++;

		if (radiusError < 0) {
			radiusError += 2 * y + 1;
		}
		else {
			x--;
			radiusError+= 2 * (y - x + 1);
		}
	}

	drawRule();
};

function drawEllipse (xc, yc, width, height)
{
	let a2 = Math.floor(width * width);
	let b2 = Math.floor(height * height);
	let h = Math.floor(height);
	let w = Math.floor(width);
	let fa2 = 4 * a2, fb2 = 4 * b2;
	let x;
	let y;
	let sigma;
	ctx.fillStyle = "rgb(200, 0, 0)";

	/* first half */
	for (x = 0, y = h, sigma = 2*b2+a2*(1-2*h); b2*x <= a2*y; x++) {
		ctx.fillRect(Math.abs(xc + x) * canvas_magnification, Math.abs(yc + y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(xc - x) * canvas_magnification, Math.abs(yc + y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(xc + x) * canvas_magnification, Math.abs(yc - y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(xc - x) * canvas_magnification, Math.abs(yc - y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		if (sigma >= 0)
		{
			sigma += fa2 * (1 - y);
			y--;
		}
		sigma += b2 * ((4 * x) + 6);
	}

	/* second half */
	for (x = w, y = 0, sigma = 2*a2+b2*(1-2*w); a2*y <= b2*x; y++) {
		ctx.fillRect(Math.abs(xc + x) * canvas_magnification, Math.abs(yc + y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(xc - x) * canvas_magnification, Math.abs(yc + y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(xc + x) * canvas_magnification, Math.abs(yc - y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		ctx.fillRect(Math.abs(xc - x) * canvas_magnification, Math.abs(yc - y) * canvas_magnification,
			canvas_magnification, canvas_magnification);
		if (sigma >= 0)
		{
			sigma += fb2 * (1 - x);
			x--;
		}
		sigma += a2 * ((4 * y) + 6);
	}
	drawRule();
}

///// イベント

window.onload = function (){

	canvas = document.getElementById("MyCanvas");

	canvas.width  = canvas_width * canvas_magnification;
	canvas.height = canvas_height * canvas_magnification;    

	ctx = canvas.getContext("2d");

	init_canvas();             
}

function lineclick() {
	islinetab = true;
	iscircletab = false;
	ispolygontab = false;
}

function circleclick() {
	islinetab = false;
	iscircletab = true;
	ispolygontab = false;
}

function polygonclick() {
	islinetab = false;
	iscircletab = false;
	ispolygontab = true;
}

var drawline = function(x0,y0,x1,y1){
	let iscentercheck = num_form.centercheck.checked;

	if (isLineRemove == true) {
		ctx.fillStyle = "#272121";  
		ctx.fillRect(0,0,canvas.width,canvas.height);
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
drawRule();
}

var plot = function(x,y){
	var col = Math.floor(x);
	var row = Math.floor(y);

	ctx.fillStyle = "rgb(200, 0, 0)";  
	ctx.fillRect(col * canvas_magnification, row * canvas_magnification,
		canvas_magnification, canvas_magnification);

	return true;
}

function image() {
	let type = 'image/png';
	let canvas = document.getElementById('MyCanvas');
	let data = canvas.toDataURL(type);
	let bin = atob(data.split(',')[1]);
	let buffer = new Uint8Array(bin.length);

	for (var i = 0; i < bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}

	let blob = new Blob([buffer.buffer], {type: type});
	let url = window.URL.createObjectURL(blob);

	let downloader = $('#download');
	downloader.attr('href', url);
}