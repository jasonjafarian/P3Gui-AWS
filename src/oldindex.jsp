<%@ page import="p3.EbuyOpenHelper"%>
<!DOCTYPE html>
<html>
<head>
<title>eBuy Open</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
<!-- Latest compiled and minified JavaScript -->
<script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="bootstrap/js/bootstrap.min.js"></script>    
<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="../bower_components/html5shiv/dist/html5shiv.js"></script>
      <script src="../bower_components/respond/dest/respond.min.js"></script>
    <![endif]-->
</head>
<body>
<%@ include file="topnav.jsp" %> 
<div class="container">
<style>
.centered {
float:none;
margin-left:auto;
margin-right:auto;
}
.top-buffer {
margin-top: 60px;
}
</style>
<div class="row top-buffer"></div>
<div class="row top-buffer">
<div class="col-lg-4 centered">
<% 
//response.addHeader("X-UA-Compatible", "IE=edge");
String errorMessage=(String)request.getAttribute("Error");
if (errorMessage!=null) {
%>
<div class="alert alert-danger">
<p align=lef">  
  <strong>Error: </strong> <%=errorMessage %>
</p>
</div>
<%}%>
<div class="panel panel-primary">
  <div class="panel-heading">
    <h3 class="panel-title">Sign in with your GSA Ent user name and password</h3>
  </div>
  <div class="panel-body">
<form class="form-horizontal"  action="login.jsp" method="post" name="loginForm" id="loginForm">
  <fieldset>
    <div class="form-group">
      <label for="userid" class="col-lg-4 control-label">User Name</label>
      <div class="col-lg-7">
        <input type="text" class="form-control" name="userid" id="userid" placeholder="GSA Ent User Name">
      </div>
    </div>
    <div class="form-group">
      <label for="password" class="col-lg-4 control-label">Password</label>
      <div class="col-lg-7">
        <input type="password" class="form-control" name="password" id="password" placeholder="Password">
      </div>
    </div>
    <div class="form-group">
      <div class="col-lg-12"><center>
        <button type="submit" class="btn btn-primary">Submit</button>
        </center>
      </div>
    </div>
  </fieldset>
</form>
  </div>
</div>
</div>
</div>
<div class="row top-buffer">
              <div class="alert alert-dismissable alert-warning">
                <h4>Warning!</h4>
                <p>This is a U.S. General Services Administration computer system 
    that is "FOR OFFICIAL USE ONLY."</p>
    <p>This system is subject to monitoring. Therefore, no expectation 
    of privacy is to be assumed.
  Individuals found performing unauthorized activities are subject 
    to disciplinary action including criminal prosecution.</p>
              </div>
            </div>
 </div>
</body>
</html>