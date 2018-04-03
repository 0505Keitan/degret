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

let gridval = 41;
let canvas_magnification = 25;
let canvas_width  = 41; 
let canvas_height = 41;    
let startPoint = {x:0,y:0};
let x2 = 0;
let y2 = 0;

let ellipsewidth = 41;
let ellipseheight = 41;

let opentab = 1;

///// 内部関数

// ページ移動で強制リロード
$(window).on('beforeunload', function() {
	location.reload();
});

// グリッドを全てリセット
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
	document.getElementById("polygon_input_id").value = 0;
	document.getElementById("polygon_degree_form").value = null;
	document.getElementById("polygon_distance_form").value = null;
	num_form.centercheck.checked = false;
	num_form.check.checked = false;
	num_form.addcheck.checked = false;
	startPoint = {x:0,y:0};

	drawRule();  
}

// グリッドの升目を描画
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

// 更新ボタンが押されたら呼ばれる関数
function numchange(){
	const number = document.getElementById("number_form").value;
	const distance_number = document.getElementById("distance_form").value;
	const radius_number = document.getElementById("radius_input_id").value;

	switch (opentab) {
		// 直線ツールが選択されている時
		case 1:
		let ischeck = num_form.check.checked;
		let iscentercheck = num_form.centercheck.checked;
		let isaddcheck = num_form.addcheck.checked;
		if(ischeck == false){
			lineRemove();
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
		break;
		// 多角形ツールが選択されている時
		case 4:
		canvas_width = (gridval);
		canvas_height = (gridval);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;
		drawPolygon();
		break;
	}
}

// レンジの値が変更された時に呼ばれる関数
$(window).ready(function(){
	$('#grid_input_id').on('change', function() {
		gridval = $(this).val();
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
		drawEllipse(Math.floor(canvas_width/2), Math.floor(canvas_height/2), ellipsewidth, ellipseheight);
		drawRule();
	})
	$('#ellipse_height_input_id').on('change', function() {
		ellipseheight = $(this).val();
		canvas_width = (ellipsewidth * 2 + 1);
		canvas_height = (ellipseheight * 2 + 1);
		canvas.width  = canvas_width * canvas_magnification;
		canvas.height = canvas_height * canvas_magnification;
		drawEllipse(Math.floor(canvas_width/2), Math.floor(canvas_height/2), ellipsewidth, ellipseheight);
		drawRule();
	})
});

// 引数で渡された距離と角度で第二地点の座標を計算する関数
function getPointByDistanceAndDegree(distance, degree){
	count = 0;

	x2 = startPoint.x + distance * Math.cos( degree * (Math.PI / 180) );
	y2 = startPoint.y + distance * Math.sin( degree * (Math.PI / 180) );

	drawline(startPoint.x,startPoint.y,x2,y2);
};

// 引数で渡された半径から縁を描画する関数
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

// 引数で渡された横幅と縦幅から縁を楕円する関数
function drawEllipse (xc, yc, width, height) {
	let a2 = Math.floor(width * width);
	let b2 = Math.floor(height * height);
	let h = Math.floor(height);
	let w = Math.floor(width);
	let fa2 = 4 * a2, fb2 = 4 * b2;
	let x;
	let y;
	let sigma;
	ctx.fillStyle = "rgb(200, 0, 0)";

	/* 楕円の半分一つ目 */
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

	/* 楕円の半分二つ目 */
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
};

// 多角形を描画する関数
function drawPolygon() {
	const polygon_number = document.getElementById("polygon_input_id").value;
	const polygon_degree = document.getElementById("polygon_degree_form").value;
	const polygon_distance = document.getElementById("polygon_distance_form").value;

	const radDiv = 180 * (parseInt(polygon_number) - 2) / parseInt(polygon_number);

	var nowdegree = 0;
	var adddegree = 0;
	var i;
	for (i = 0; i <= polygon_number - 1; i++) {
		if (i == 0) {
			startPoint.x = Math.floor(canvas_width/2);
			startPoint.y = Math.floor(canvas_height/2);
			num_form.centercheck.checked = false;
			iscentercheck = false;
			nowdegree = parseInt(polygon_degree);
			adddegree = parseInt(nowdegree);
			getPointByDistanceAndDegree(polygon_distance, nowdegree);
		} else {
			startPoint.x = x2;
			startPoint.y = y2;
			num_form.centercheck.checked = false;
			iscentercheck = false;
			nowdegree = adddegree;
			adddegree = parseInt(nowdegree) + 180 - parseInt(radDiv);
			getPointByDistanceAndDegree(polygon_distance, adddegree);
		}
	}
};

///// イベント

window.onload = function (){

	canvas = document.getElementById("MyCanvas");

	canvas.width  = canvas_width * canvas_magnification;
	canvas.height = canvas_height * canvas_magnification;    

	ctx = canvas.getContext("2d");

	init_canvas();             
};

function lineclick() {
	opentab = 1;
};

function polygonclick() {
	opentab = 4;
};

// グリッド状の線を全て消す関数
function lineRemove() {
	ctx.fillStyle = "#363333";  
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

// 引数で渡された第一座標と第二座標で直線を描画する関数
let drawline = function(x0,y0,x1,y1){

	let tmp;
	let steep = Math.abs(y1-y0) > Math.abs(x1-x0);
	if(steep){
    //swap x0,y0
    tmp=x0; x0=y0; y0=tmp;
    //swap x1,y1
    tmp=x1; x1=y1; y1=tmp;
};

let sign = 1;
if (x0>x1) {
	sign = -1;
	x0 *= -1;
	x1 *= -1;
};
let dx = x1-x0;
let dy = Math.abs(y1-y0);
let err = ((dx/2));
let ystep = y0 < y1 ? 1:-1;
let y = y0;

for (let x=x0;x<=x1;x++) {
	if(!(steep ? plot(y,sign*x) : plot(sign*x,y))) return;
	err = (err - dy);
	if(err < 0){
		y+=ystep;
		err+=dx;
	}
};
drawRule();
};

// ここで直線を描画
let plot = function(x,y){
	let col = Math.floor(x);
	let row = Math.floor(y);

	ctx.fillStyle = "rgb(200, 0, 0)";  
	ctx.fillRect(col * canvas_magnification, row * canvas_magnification,
		canvas_magnification, canvas_magnification);

	return true;
};

// グリッドを画像に変換してダウンロードする関数
function image() {
	const type = 'image/png';
	const canvas = document.getElementById('MyCanvas');
	const data = canvas.toDataURL(type);
	const bin = atob(data.split(',')[1]);
	const buffer = new Uint8Array(bin.length);

	for (var i = 0; i < bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}

	const blob = new Blob([buffer.buffer], {type: type});
	const url = window.URL.createObjectURL(blob);

	const downloader = $('#download');
	downloader.attr('href', url);
}