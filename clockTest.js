
var clockHandler;

window.onload = function()
{
	// Starts clocks
	clockHandler = new Clock( 20/*, "clockClass"*/ );
	clockHandler.startStop();
	
	
	// add events
	var colorPicker = document.getElementById( "cpColor" );
	colorPicker.oninput = function() { document.getElementById( "color" ).value = this.value; generate() };
	
	colorPicker = document.getElementById( "cpBackground" );
	colorPicker.oninput = function() { 
		var txtfield = document.getElementById( "background" );
		if ( txtfield.value.trim() != "" )
			txtfield.value += ",";
		txtfield.value += this.value;
		generate();
	};

	colorPicker = document.getElementById( "cpOuterColor" );
	colorPicker.oninput = function() { document.getElementById( "outerColor" ).value = this.value; generate() };
	
	
	generate();  // initial generated clock
}


function getSelectValue( id )
{
	return document.getElementById( id ).options[ document.getElementById( id ).selectedIndex ].value
}


function getInputValue( id )
{
	return document.getElementById( id ).value;
}


function generate()
{
	if ( !clockHandler.isRunning() )
		clockHandler.startStop();
		
	var code = "<canvas class='clockClass' width='" + getInputValue( "width" ) + "' height='" + getInputValue( "height" ) + "'"
		+ " data-type='" + getInputValue( "type" ) + "'"
		+ " data-ticks='" + getSelectValue( "ticks" ) + "'"
		+ " data-outer-color='" + getInputValue( "outerColor" ) + "'"
		+ " data-color='" + getInputValue( "color" ) + "'"
		+ " data-background='" + getInputValue( "background" ) + "'"
		+ " data-numerals='" + getSelectValue( "numerals" ) + "'"
		+ " data-font-family='" + getInputValue( "fontFamily" ) + "'"
		+ " data-gradient='" + getInputValue( "gradient" ) + "'>"
		+ "Canvas not sopported. Update browser."
	+ "</canvas>";
	
	document.getElementById( "tdGenerator" ).innerHTML = code;
	document.getElementById( "tdCode" ).innerHTML = "<code>" + code.replace( /\</g, "&lt;" ).replace( /\>/g, "&gt;" ) + "</code>";
}
