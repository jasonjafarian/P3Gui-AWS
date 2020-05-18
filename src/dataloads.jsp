<!doctype html>
<html>
<head>
<meta charset="UTF-8">

<meta http-equiv="X-UA-Compatible" content="IE=EDGE;IE=9; IE=8; IE=7; " />
<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />


<title>CAP OS :: INGEST</title>

<!--==================================================
          CSS
================================================== -->
<!--
<link rel="stylesheet" href="./theme/css/jquery-ui.css" />
<script  src="../js/jquery.min.js"></script>
<script  src="../js/jquery-ui.min.js"></script>-->
<link rel="stylesheet"
  href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/themes/smoothness/jquery-ui.css">
<script
  src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script
  src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>

<link rel="stylesheet" type="text/css"
  href="p3/upload-assets/libs/bs/css/bootstrap.css">
<link rel="stylesheet" type="text/css"
  href="p3/upload-assets/libs/fa-4.3/css/font-awesome.css">

<!--RESPOND.JS
+++++++++++++++++++++++++++++++++++++++++++++++++-->
<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
<!--[if lt IE 9]>
<script src="assets/js/html5shiv.min.js"></script>
<script src="assets/js/respond.min.js"></script>
<![endif]-->

<script src="p3/upload-assets/js/respond.min.js"></script>

<!-- CAP OS CORE CSS
+++++++++++++++++++++++++++++++++++++++++++++++++-->
<link rel="stylesheet" type="text/css"
  href="p3/upload-assets/css/cap-os.css">
<!--==================================================
          ANGULAR JS
================================================== -->
<!--<script src="assets/libs/angular/angular.min.js"></script>-->

</head>
<body>
  <!-- skip nav link for 508 -->
  <a href="#r_content-main" class="sr-only">Skip to Content</a>
  <!--================ NAVBAR =================================-->

  <!--================ HEADER =================================-->
  <header class="homepage-hero-box">
    <h1>
      <span class="fa fa-cloud-upload"></span><br />INGEST
    </h1>
  </header>

  <!--================ LCA ====================================-->

  <div id="lca" class="container-fluid">

    <!-- BLOCK - LCA Bar
     ################################################-->

    <div id="b_lca-bar">

      <!-- NODE - LCA State
      ++++++++++++++++++++++++++++++++++++++++++++-->
      <div id="lca-state">
        <!-- default state shown in example -->
        <div class="col-xs-12 col-sm-12">
          <div class="progress">
            <div style="width: 100%" class="progress-bar progress-bar-warning"></div>
          </div>
          <span class="lca-title">CONNECT</span>
        </div>

      </div>
    </div>

    <!--  /END BLOCK - LCA Bar
     ###############################################-->

  </div>



  <!--================ QUICK NAV ==============================-->
  <section id="r_quick-nav">
    <div class="container">
      <!-- ALERT AND ERROR MESSAGES GO HERE -->
      <!-- ERROR ALERT -->
      <div class="alert alert-danger alert-dismissible" role="alert"
        id="failure" style="display: none">
        <button type="button" class="close" data-dismiss="alert"
          aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        There was an error processing your file.
      </div>
      <!-- SUCCESS ALERT -->
      <div class="alert alert-success alert-dismissible" role="alert"
        id="success" style="display: none">
        <button type="button" class="close" data-dismiss="alert"
          aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        Your file uploaded successfully.
      </div>
    </div>
  </section>

  <!--================ FORM ==============================-->
  <div id="r_content-main">
    <div class="container">
      <form action="http://p3.cap.gsa.gov:8081/FileUploadService" method="post" name="fileform"
        id="targetform" enctype="multipart/form-data">
        <!--

  <div class="col-xs-12 col-sm-6">
            <label for="username" >
            <h4><span class="label label-warning">1</span> Username</h4>
            </label>
            <input name="username" type="text" id="username" class="form-control" placeholder="Username">
            <p class="help-block">Username should be alphanumeric and greater than 16 characters</p>
            <div class="clearfix">&nbsp;</div>
          </div>

 PASSOWRD
  <div class="col-xs 12 col-sm-6">
            <label for="password" >
            <h4><span class="label label-warning">2</span> Password</h4>
            </label>
            <input name="password" type="password" id="password" class="form-control" placeholder="Password">
            <div class="clearfix">&nbsp;</div>
          </div>
  -->
        <!-- INSTRUCTIONS -->
        <div class="col-xs-12 col-sm-12">
          <hr />

          <!--<h4><span class="label label-warning">3</span> Choose your file -->
          <!--<small>The preferred format is <span class="fa fa-file-word-o"></span> MS Word (.doc, or .docx). For convience, you may also include <span class="fa fa-file-pdf-o"></span> PDF format.</small>-->
          <!--</h4>-->
          <h4>
            <span class="label label-warning"></span> Choose your file
            <!--<small>The preferred format is <span class="fa fa-file-word-o"></span> MS Word (.doc, or .docx). For convience, you may also include <span class="fa fa-file-pdf-o"></span> PDF format.</small>-->
          </h4>
          <h4 style="margin-left: 15PX;">
            <small>To begin, please use the browse button to locate
              the file you wish to upload. <br> To complete the process,
              use the upload button.
            </small>
          </h4>
          <div class="clearfix">&nbsp;</div>
        </div>

        <!-- PROGRESS BAR -->
        <!--<div id="progressbar"></div>-->
        <!--
 <div class="col-xs-12 col-sm-12">
<div class="progress" id="progressbar-load">
  <div class="progress-bar active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 45%">
    <span class="sr-only">45% Complete</span>
  </div>
</div>
</div>
-->
        <div id="uploadmessage" style="color: red; display: none">
          <h1>File Uploading...Please wait...</h1>
        </div>
        <br>
        <!-- FILE UPLOAD -->

        <!--
  <div class="col-xs-12 col-sm-12">
  <label class="sr-only" for="file-3a">Browse for files</label>
  <input id="file-3a" type="file" multiple=true class="file" title="File Upload" name="File Upload" data-preview-file-type="any" data-initial-caption="" data-overwrite-initial="false">
  </div>
-->
        <div class="col-xs-12 col-sm-12">
          <div class="input-group">
            <label for="file" class="sr-only">File input</label> <input
              type="file" class="form-control" id="file-3a" name="fileform" />
            <input type="hidden" name="session_id" value="{{session_id}}" />
            <input type="hidden" name="acsrf" value="{{acsrf}}" /> <input
              type="hidden" name="token" value="{{token}}" /> <span
              class="input-group-btn">
              <button type="reset" class="btn btn-black">Clear</button>
              <button type="submit" class="btn btn-black">Upload</button>
            </span>

          </div>
        </div>



      </form>
      <div class="clearfix">&nbsp;</div>
    </div>
  </div>

  <!--================ FOOTER ========================-->

  <div id="r_footer">
    <div class="container">
      <div class="clearfix">&nbsp;</div>
    </div>
  </div>

  <!--================ CORE SCRIPTS - DO NOT REMOVE ================================-->
  <script src="p3/upload-assets/libs/jquery-2.1.1.min.js"></script>
  <noscript></noscript>
  <script src="p3/upload-assets/libs/bs/js/bootstrap.min.js"></script>
  <noscript></noscript>

  <!-- MODERENIZER 2.8.3
+++++++++++++++++++++++++++++++++++++++++++++++++-->
  <script src="p3/upload-assets/libs/modernizr.2.8.3.js"></script>
  <noscript></noscript>
  <script src="p3/upload-assets/js/classie.js"></script>
  <noscript></noscript>


  <!-- FILE INPUT -->
  <script src="p3/upload-assets/js/fileinput.js"></script>
  <noscript></noscript>

  <script>
		$('#uploadmessage').hide()
		$('#failure').hide()
		$('#success').hide()
		if ('${requestScope.status}' == "S") {
			$("#success").show();
		} else if ('${requestScope.status}' == "F") {
			$("#failure").show();
			$("#failure").text('${requestScope.msg}')
		}
	
		$('#progressbar-load').hide();
		    if ('{{RESTCALL_SUCCESS}}' == 'Y') {
			  $("#success").show();
		} else if ('{{RESTCALL_SUCCESS}}' == 'N')  {
			  $("#failure").show();
			  $("#failure").text('{{DISPLAY_MESSAGE}}')
		}
		else if ('{{RESTCALL_SUCCESS}}' == 'U')  {
		              $("#failure").hide();
		              $("#success").hide();
		    }
	
		$("#file-3").fileinput({
			browseClass : "btn btn-warning  ",
			showUpload : false,
			showRemove : false,
			showCaption : false,
			fileType : "any"
		});
		$(".btn-warning").on('click', function() {
			if ($('#file-3').attr('disabled')) {
				$('#file-3').fileinput('enable');
			} else {
				$('#file-3').fileinput('disable');
			}
		});
		function validateform() {
			var z = document.forms['fileform']['File Upload'].value;
			if (z == null || z == "") {
				alert("Please attach a file");
				return false;
			}
		}
		$(function() {
			$("#targetform").on("submit", function(event) {
				if (validateform() != false) {
					$('#progressbar-load').show();
					$("#failure").hide();
					$("#success").hide();
					$('#uploadmessage').show()
				} else {
					event.preventDefault();
				}
			})
		});
  </script>
  <style>
#progressbar .ui-progressbar-value {
  background-color: red;
}
</style>
  <noscript></noscript>
</body>
</html>
