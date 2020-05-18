<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@page contentType="text/html"%>
<%@page pageEncoding="UTF-8"%>

<!DOCTYPE html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />
<!-- <META HTTP-EQUIV="refresh" CONTENT="<%=session.getMaxInactiveInterval()%>; URL=/gui" /> -->
<script src="vendor/xhr-xdr-adapter.js" type="text/javascript"></script>
<script src="vendor/pace.min.js"
  data-pace-options='{ "ajax": false, "elements": {"selectors": [".ng-binding"] } }'
  type="text/javascript">
  pace.start()
</script>
<link href="css/pace-theme-center-atom.css" rel="stylesheet" />


<link rel="stylesheet" href="css/bootstrap.light.min.css" title="Light">
<link rel="stylesheet" href="css/timepicker.css">
<link rel="stylesheet" href="css/animate.min.css">
<link rel="stylesheet" href="css/normalize.min.css">
<link rel="stylesheet" href="css/rotate.css">
<!-- load the root require context -->
<script src="vendor/require/require.js"></script>
<script src="app/components/require.config.js"></script>


<script>
  require([ 'app' ], function() {
  })
</script>
<link rel="stylesheet" type="text/css" href="../p3/css/p3-os-v1.css">
<meta charset="utf-8">
<!--<meta http-equiv="X-UA-Compatible" content="IE=9,">-->
<meta name="viewport" content="width=device-width">
<title>Prices Paid Portal</title>
<link rel="icon" type="image/png" href="../p3/art/favicon.png">
<script id="_fed_an_ua_tag"
  src="vendor/Universal-Federated-Analytics-Min.1.0.js?ver=true&agency=acquisition.gov&pua=UA-48986383-1"
  type="text/javascript"></script>

<script src="../p3/js/jquery-1.11.3.min.js"></script>
<script src="help.js"></script>

</head>
<body>

  <a href="/gui/test.jsp" class="sr-only">Please click now to use the
    accessable version of this application.</a>
  <div ng-cloak>
    <link rel="stylesheet"
      ng-href="css/bootstrap.{{dashboard.current.style||'dark'}}.min.css">
    <link rel="stylesheet" href="css/bootstrap.light.min.css"
      title="Light">
    <link rel="stylesheet" href="css/bootstrap-responsive.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">

    <div ng-repeat='alert in dashAlerts.list'
      class="alert-{{alert.severity}} dashboard-notice" ng-show="$last"
      style="position: fixed">
      <button type="button" class="close"
        ng-click="dashAlerts.clear(alert)" style="padding-right: 50px">&times;</button>
      <strong>{{alert.title}}</strong> <span
        ng-bind-html-unsafe='alert.text'></span>
      <div style="padding-right: 10px" class='pull-right small'>
        {{$index + 1}} alert(s)</div>
    </div>
    <!-- /START NAVABR -->

    <div id="r_nav-container">
      <nav role="navigation" class="navbar navbar-inverse navbar-fixed-top">
        <div class="container-fluid">
          <div class="navbar-header">
            <!--<button data-target="#ag-links" data-toggle="collapse" class="navbar-toggle" type="button"> <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button>-->
            <a href="https://hallways.cap.gsa.gov" class="navbar-brand"> <span
              class="brand-back" style="z-index: 1000;"></span> <span
              class="brand-text">Acquisition Gateway</span>
            </a>
          </div>
          <div id="ag-links" class="collapse navbar-collapse">

            <div style="margin-top: 5px;">

              <ul class="nav navbar-nav pull-right">
                <li><a href="mailto:p3@gsa.gov">Contact Us</a></li>
                <li id="logoutLink"><a>Sign Out</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
    <!-- /END NAVABR -->
    <!--================ HEADER ========================-->
    <!-- #Header/Search Block -->
    <div class="homepage-headBox-box-int">
      <div class="container">
        <h1 class="DINCondensedBold">PRICES PAID PORTAL</h1>
      </div>
    </div>
    <!-- /END #Header/Search Block -->

    <div class="clearfix">&nbsp;</div>


    <div class="content-wrapper">
      <div class="container-fluid main">
        <div class="row-fluid">
          <div ng-view></div>
        </div>
      </div>
    </div>

  </div>

  <!--==================================================
          FOOTER
================================================== -->

  <div id="r_footer">
    <div class="container-fluid">

      <h2 class="DINCondensedBold">ACQUISITION GATEWAY</h2>


    </div>

  </div>


</body>
<script>
  $(document).ready(function()
      {
    function Logout() {
      //alert("Logout called")
      //$.get("/gui/Logout", function(responsetext){
        //console.log('logged successfully')
      //	console.log('logged successfully');
      //	});
      $.ajax(
        {url:'/gui/Logout'
        ,success:function(responsetext){
          if (responsetext == 'LOGGED_OUT') {
              console.log("responsetext = " + responsetext);
              alert("You are now securely logged out.");
              window.location = '/gui';
              }
          }
        }
          )


    }

    $("#logoutLink").click(Logout);

      })
  </script>

</html>
