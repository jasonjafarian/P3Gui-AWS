
//	window.onbeforeunload = function (e) {
//	Logout();   
//	};
	
	
	window.flagAsIE = function(version) {
			var cls = document.body.parentElement.getAttribute('class');
			document.body.parentElement.setAttribute('class', "ie ie" + version
					+ " " + cls);
		};

		var clickdatetime_p3 = new Date();

		$(document).ready(function() {

			$('body').bind('click keypress', function() {
				clickdatetime_p3 = new Date()
				//console.log("clickdatetime =  " + clickdatetime_p3);
			});

			setInterval(function() {
				var today_p3 = new Date();
				var diff_p3 = Math.abs(clickdatetime_p3 - new Date());
				var minutes_p3 = Math.floor((diff_p3 / 1000) / 60);
				//console.log("Session Check called")
				//SessionCheck()			
				//console.log("Session Check call over")
				//console.log("Difference in minutes ==  " + minutes_p3);
				if (minutes_p3 > 20) {
					alert("Session timeout. Please log back again");
					if (window.location.protocol !== 'https:') {
						window.location = 'https://' + window.location.hostname + '/gui/';
					}else{
						window.location = '/gui/';
					}
				}
			}, 10000);

			/*				
			function SessionCheck(){
				console.log("SessionCheckCalled");
				$.ajax(
						{url:'/gui/CheckSession'
						,success:function(responsetext){
							console.log("Session Timeout responsetext = " + responsetext);
							if (responsetext == 'TIMED_OUT') {
									console.log("Session Timeout responsetext = " + responsetext);
									alert("Your Session has expired.Please login again.");
									window.location = '/gui';
									}
							}
						}
						)	
			
			}


			setInterval(function(){
				var today = new Date();
				var lastaccessedtime = new Date(${pageContext.session.lastAccessedTime});
				//console.log("lastaccessedtime = " + lastaccessedtime)
				var diff = Math.abs(new Date() - new Date(${pageContext.session.lastAccessedTime}));
				var minutes = Math.floor((diff/1000)/60);
				//console.log("Session Check called")
				//SessionCheck()			
				//console.log("Session Check call over")
				//console.log("Difference in minutes ==  " + minutes);
				//if (minutes > 3){
				//	alert("Session timeout. Please log back again");
				//	window.location = '/gui';
				//	}			
				},10000);
			 */
			function Logout() {
				$.ajax({
					url : '/gui/Logout',
					success : function(responsetext) {
						console.log("responsetext = " + responsetext);
						if (responsetext == 'LOGGED_OUT') {
							alert("You are now securely logged out.");
							if (window.location.protocol !== 'https:') {
								window.location = 'https://' + window.location.hostname + '/gui/';
							}else{
								window.location = '/gui/';
							}
							
							
						}
					}
				})
			}

			$("#logoutLink").click(Logout);

		})
