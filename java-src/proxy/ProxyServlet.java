package proxy;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;


import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


import p3.EbuyOpenHelper;
import p3.util.SolrRoundRobinHosts;


public class ProxyServlet extends HttpServlet {

	private static final Log logger = LogFactory.getLog(ProxyServlet.class);

	private static final long serialVersionUID = 1L;

	private final String USER_AGENT = "Mozilla/5.0";

	public static String basicAuthCredential;
	public static final String log1 = "Destintation Server for Proxy ";
	private List<String> allowedRequestPatterns = new ArrayList<String>();
	private static SolrRoundRobinHosts solrRoundRobinHost = new SolrRoundRobinHosts(EbuyOpenHelper.getRestservername(),EbuyOpenHelper.getRestservername2());

	public ProxyServlet() {
		super();
	}

	public void init() throws ServletException {
		super.init();

		basicAuthCredential = System.getProperty("SOLR_CREDENTIAL_FOR_PROXY",
				EbuyOpenHelper.getSolrCredentials());

		logger.info("Basic Auth Credential for destination server "
				+ basicAuthCredential);

		Enumeration<String> parameterNames = getInitParameterNames();
		while (parameterNames.hasMoreElements()) {
			String parameterName = parameterNames.nextElement();
			if (parameterName.startsWith("allowedRequestPattern")) {
				String value = getInitParameter(parameterName);
				logger.info(parameterName + "=" + value);
				allowedRequestPatterns.add(value);


			}
		}
	}

	public static void addAuthHeader(HttpURLConnection con) {
		if (basicAuthCredential != null && basicAuthCredential.length() > 0) {
			String authEncoding = new String(
					Base64.encodeBase64(basicAuthCredential.getBytes()));
			con.setRequestProperty("Authorization", "Basic " + authEncoding);
		}
	}

	private boolean doMyGet( String queryStringWithPath,
			HttpServletResponse response, HttpServletRequest request)
					throws IOException {
		String solrRequestURL = null;
		final String CHECK_TOKEN = "P3Checked";

		String solrBaseUrl = p3.EbuyOpenHelper.getRestservername();
		String solrFailoverUrl = null;


		SolrRoundRobinHosts.RoundRobinHostDetail roundRobinHostDetail = solrRoundRobinHost.next();

                solrBaseUrl = roundRobinHostDetail.getPrimaryHost();
                solrFailoverUrl = roundRobinHostDetail.getFailoverHost();

                logger.info(" Round Robin Host Details " + roundRobinHostDetail );

		String queryStringPath = queryStringWithPath.substring(6) + "&shards.tolerant=true";;


		HttpSession  session=request.getSession();
		String dataSource=(String) session.getAttribute("datasource");
		logger.info(" Datasource Name " + dataSource );



		//Users only with a valid session will be allowed to access SOLR, this is a additional check so there is no cracks.
		logger.info("Prem Session == session.getAttribute(CHECK_TOKEN) " + session.getAttribute(CHECK_TOKEN));
		if (session.getAttribute(CHECK_TOKEN) == null) {
			//if (session.isNew()){
			logger.info("Page is getting redirected -- not logged in ");
			response.sendRedirect(request.getContextPath() + "/");
			return false;
		}
		else{
			BufferedReader bufferedReader = null;
			HttpURLConnection con = null;

			response.addHeader("DataSource", dataSource);
			ServletOutputStream sout = response.getOutputStream();

			try {

				solrRequestURL = solrBaseUrl + queryStringPath + "&shards.tolerant=true";

				logger.info( " Solr Request URL " + solrRequestURL );

				try {
					URL obj = new URL(solrRequestURL);

					con = (HttpURLConnection) obj.openConnection();
					addAuthHeader(con);
					con.setRequestMethod("GET");
					con.setRequestProperty("User-Agent", USER_AGENT);

					int responseCode = con.getResponseCode();


					logger.info(" Response From SOLR/FUSION " + responseCode );

					// logger.info("Sent 'GET' request to URL : " + wholeUrl
					// + "and received response code: " + responseCode);
					if (responseCode != 200) {
						throw new IOException("Unexpected response code: " + responseCode);
					}

					bufferedReader = new BufferedReader(new InputStreamReader(
							con.getInputStream()));
				} catch ( java.io.IOException ue ) {
					// call the fail over server if there is a secondary server
					// TODO: Create a new method for actual call to fusion so that it can be called from multiple places
					if ( solrFailoverUrl != null ) {
						solrRequestURL = solrFailoverUrl + queryStringPath + "&shards.tolerant=true";

						logger.info(" Error Connecting to Primary Node and calling secondary node " + solrRequestURL );
						URL obj = new URL(solrRequestURL);

						con = (HttpURLConnection) obj.openConnection();
						addAuthHeader(con);
						con.setRequestMethod("GET");
						con.setRequestProperty("User-Agent", USER_AGENT);

						int responseCode = con.getResponseCode();


						logger.info(" Response From SOLR/FUSION " + responseCode );

						// logger.info("Sent 'GET' request to URL : " + wholeUrl
						// + "and received response code: " + responseCode);
						if (responseCode != 200) {
							throw new IOException("Unexpected response code: " + responseCode);
						}

						bufferedReader = new BufferedReader(new InputStreamReader(
								con.getInputStream()));
					} else {
						throw ue;
					}
				}

				String inputLine;

				while ((inputLine = bufferedReader.readLine()) != null) {

					sout.write(inputLine.getBytes());
					sout.write("\n".getBytes());
				}

				sout.flush();
				return true;
			} catch (IOException e) {
				logger.warn("Call to " + solrRequestURL + " is unsuccessful with error: "
						+ e);
				response.reset();
				return false;

			} catch (Exception e ) {
				logger.warn("Call to " + solrRequestURL + "is unsuccessful With erro : " + e);
				response.reset();
				return false;
			} finally {
				bufferedReader.close();
				con.disconnect();
				sout.close();
			}
		}

	}


	public void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException,
	MalformedURLException {

		String urlWithQueryString = request.getRequestURI().substring(
				request.getContextPath().length())
				+ "?"
				+ request.getQueryString();

		logger.info( " URL with Query String " + urlWithQueryString );

		//
		// throw an error if the user is requesting more than 50,000 records from the server
		//
		String rowsString = request.getParameter("rows");

		if ( rowsString != null ) {
			int rowsRequesting = Integer.valueOf( rowsString );

			if ( rowsRequesting > 50000 ) {
				throw new ServletException("Your request is trying to retreive more than 50,000 rows from the solr server");
			}
		}
		///////////////////////////////

		try {
			if ( request.getQueryString() != null && request.getQueryString().length() > 0 ) {
				doMyGet( urlWithQueryString, response, request);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
