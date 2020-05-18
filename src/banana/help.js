
$('document').ready(function() {
	var help = 0;
	showhelp = function(){
		
		alert("Starting Help Function");
		var container = $( "#helpcontainer" );
		$(".panelCont").fadeTo("slow",0.4);
		$(".panelCont:first").fadeTo("slow",1);
		help = 1;
		
		$(".panelCont").each(function(){
			$(this).fadeTo("slow",1);
			
		});
	};
	
	


});