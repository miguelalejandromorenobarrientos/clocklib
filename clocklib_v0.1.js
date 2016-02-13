/**
*	This constructor implements objects for drawing clocks in
*	a canvas with class 'className' and 'lapse' refresh rate in HTML5
*
*	Usage: 
*		var clockHandler = new Clock(); [new Clock( 200 ); new Clock( 200, 'myClocks' )]
*		clockHandler.startStop();
*
*	Author: Miguel Alejandro Moreno Barrientos 2015
*/
function Clock( lapse, className )
{
	"use strict";
	var clockThread = null;  // private: clock shared thread
	lapse = lapse || 1000;  // private: ms for refresh
	className = className || "clockClass";  // private: class name of the clock canvas
	
	// "const"
	var PI2 = 2 * Math.PI, PI1_2 = Math.PI / 2;
	var ARRAY_ARABIC = ["1","2","3","4","5","6","7","8","9","10","11","12"];
	var ARRAY_ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

	
	/**
	*	Redraws all canvas.className elements for updating clocks
	*/
	function reDrawClockCanvas()  // private method
	{
		var canvases = document.querySelectorAll( "canvas." + className );  // get clock canvases
		
		for ( var i = 0; i < canvases.length; i++ )  // update canvases
			paintClockCanvas( canvases[i] );
	}
	
	
	/**
	*	Draw clock in a canvas
	*/
	function paintClockCanvas( canvas )  // private method
	{
		var width = canvas.width;
		var height = canvas.height;
		var minwh = Math.min( width, height );
		var centerX = width / 2;
		var centerY = height / 2;
		var context = canvas.getContext( "2d" );
		var timeInstance = time();
		canvas.setAttribute( "title", timeInstance.date );
		var fontFamily = canvas.getAttribute( "data-font-family" ) || "Arial";
		
	
		// set main colors
		context.strokeStyle = canvas.getAttribute( "data-color" ) || "black";
		var background = canvas.getAttribute( "data-background" ) || "white";
		background = background.split( "," );  // get multiple colors for gradient
		if ( background.length > 1 )  // gradient
		{
			var dir = canvas.getAttribute( "data-gradient" ) || "0,0," + width + "," + height;
			var dir = dir.split( "," );
			var gradient = context.createLinearGradient( dir[0] || 0, dir[1] || 0, dir[2] || width, dir[3] || height );
			
			for ( var i = 0; i < background.length; i++ )
				gradient.addColorStop( i / ( background.length - 1 ), background[i].trim() );
				
			context.fillStyle = gradient;
		}
		else  // only one color
			context.fillStyle = background[0];

	
		// get clock type and paint
		var type = canvas.getAttribute( "data-type" ) || "analog";
		type = type.toLowerCase();
		
		if ( type == "analog" )
			paintAnalog();
		else if ( type = "digital" )
			paintDigital();

	
		/**
		*	Paints an analog clock
		*/
		function paintAnalog()
		{
			// draw outer-background
			context.save();
			context.fillStyle = canvas.getAttribute( "data-outer-color" ) || "rgba( 0,0,0,0 )";
			context.fillRect( 0, 0, width, height );
			context.restore();

			// draw clock border and clock background
			context.beginPath();	
			context.lineWidth = 1;		
			drawEllipse( context, centerX, centerY, width - context.lineWidth, height - context.lineWidth, 0, PI2, false );
			context.fill();
			context.stroke();
			
			// draw ticks
			var ticks = canvas.getAttribute( "data-ticks" ) || "lines";
			ticks = ticks.toLowerCase();
			if ( ticks != "none" )
				for ( var i = 0; i < 60; i++ )
				{
					var ang = PI2 / 60 * i;
					var cos = Math.cos( ang ), sin = Math.sin( ang );
	
					context.beginPath();				
					if ( ticks == "lines" )
					{
						context.lineWidth = 1;
						context.moveTo( centerX +cos * width / 2, centerY + sin * height / 2 );
						if ( i % 5 != 0 )
							context.lineTo( centerX + cos * width / 2.2, centerY + sin * height / 2.2 );
						else
						{
							context.lineWidth = 2;				
							context.lineTo( centerX + cos * width / 2.5, centerY + sin * height / 2.5 );
						}
						context.stroke();
					}
					else if ( ticks == "circles" )
					{
						var radius =  minwh / 50; 
						if ( i % 5 != 0 )
							radius /= 2;
						context.fillStyle = context.strokeStyle;
						context.arc( centerX + Math.cos( ang ) * width / 2.3, centerY + Math.sin( ang ) * height / 2.3, radius, 0, PI2, false );
						context.fill();
					}
					else
						break;
				}
				
			// draw numerals
			var numerals = canvas.getAttribute( "data-numerals" ) || "none";
			numerals = numerals.toLowerCase();
			if ( numerals != "none" )
			{
				var array_num = numerals == "roman" ? ARRAY_ROMAN : ARRAY_ARABIC;
				context.beginPath();
				context.textAlign = "center";
				context.font = minwh / 12 + "px " + fontFamily;
				for ( var i = 1; i <= 12; i++ )
				{
					var ang = -PI1_2 + PI2 / 12 * i;
					var cos = Math.cos( ang ), sin = Math.sin( ang );
					context.save();
					context.strokeStyle = "black";
					context.strokeText( array_num[ i-1 ], centerX + cos * width / 2.8 + 1, centerY + sin * height / 2.8 + minwh / 30 + 1 );
					context.restore();
					context.strokeText( array_num[ i-1 ], centerX + cos * width / 2.8, centerY + sin * height / 2.8 + minwh / 30 );
				}
			}
			
			// draw hour pointer
			context.beginPath();
			context.lineWidth = 4;
			var ang = -Math.PI / 2 + ( timeInstance.hours % 12 ) / 12 * PI2;
			var cos = Math.cos( ang ), sin = Math.sin( ang );
			context.moveTo( centerX, centerY );
			context.lineTo( centerX + width / 3 * cos, centerY + height / 3 * sin );
			context.stroke();
		
			// draw minute pointer
			context.beginPath();
			context.lineWidth = 2;
			ang = -Math.PI / 2 + timeInstance.minutes / 60 * PI2;
			cos = Math.cos( ang ), sin = Math.sin( ang );
			context.moveTo( centerX, centerY );
			context.lineTo( centerX + width / 2.5 * cos, centerY + height / 2.5 * sin );
			context.stroke();
		
			// draw second pointer
			context.beginPath();
			context.lineWidth = 1;
			ang = -Math.PI / 2 + timeInstance.seconds / 60 * PI2;
			cos = Math.cos( ang ), sin = Math.sin( ang );
			context.moveTo( centerX + width / -6.6 * cos, centerY + height / -6.6 * sin );
			context.lineTo( centerX + width / 2.2 * cos, centerY + height / 2.2 * sin );
			context.stroke();
			
			// draw central circle
			context.beginPath();
			context.fillStyle = context.strokeStyle;
			context.arc( centerX, centerY, minwh / 20, 0, PI2, false );	
			context.fill();
		}
		
		
		/**
		*	Paints a digital clock
		*/
		function paintDigital()
		{
			// draw background and border
			context.lineWidth = 1;
			context.fillRect( 0, 0, width, height );
			context.strokeRect( 0, 0, width, height );
			
			// set string time
			var hours = timeInstance.date.getHours();
			hours = hours < 10 ? "0" + hours: hours;
			var minutes = timeInstance.date.getMinutes();
			minutes = minutes < 10 ? "0" + minutes: minutes;
			var seconds = timeInstance.date.getSeconds();
			seconds = seconds < 10 ? "0" + seconds: seconds;			
			var time = hours + ":" + minutes + ":" + seconds;
				
			// draw string time
			context.textAlign = "center";
			var font = Math.min( width / 5, height );
			context.font = font + "px " + fontFamily;
			context.fillStyle = context.strokeStyle;
			context.save();
			context.fillStyle = "black";
			context.fillText( time, centerX + 1, centerY + font / 3 + 1 );
			context.restore();
			context.fillText( time, centerX, centerY + font / 3 );
		}		
	}
	
	
	/**
	*	get current time
	*/
	function time()  // private method
	{
		var date = new Date();
		
		return {
			"hours": date.getHours() + ( date.getMinutes() + ( date.getSeconds() + date.getMilliseconds() / 1000 ) / 60 ) / 60,  // [0,24)
			"minutes": date.getMinutes() + ( date.getSeconds() + date.getMilliseconds() / 1000 ) / 60,  // [0,60)
			"seconds": date.getSeconds() + date.getMilliseconds() / 1000,  // [0,60)
			"date": date
		};
	}
	

	/**
	*	Draws a ellipse without stroke deformation
	*/
	function drawEllipse( context, x, y, w, h, startAng, endAng, clockwise )  // private method
	{
		context.save();
		
		context.beginPath();
		context.translate( x, y );
		context.scale( w / 2, h / 2 );
		context.lineWidth = context.lineWidth * 2 / w;  // stroke is deformed by scale
		context.arc( 0, 0, 1, startAng, endAng, clockwise );
		
		context.restore();
	}
	
	
	/**
	*	starts/stops all clocks
	*/
	this.startStop = function() { // privileged method

		reDrawClockCanvas();
		
		if ( !this.isRunning() )  // start clock thread
			this.clockThread = setInterval( reDrawClockCanvas, lapse );
		else  // stop clock thread
		{
			clearInterval( this.clockThread );
			this.clockThread = null;
		}
	}
	
	
	/**
	*	checks if handler is running
	*/
	this.isRunning = function()	{ // privileged method
		return this.clockThread != null;
	}
}
