package p3;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet. * ;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

public class AccessCheckFilter implements Filter {

	private static final Log logger = LogFactory.getLog(AccessCheckFilter.class);

	public static final String CHECK_TOKEN = "P3Checked";
	public static final String ACCESS_DENIED = "P3AccessDenied";

	final List < String > excludedRequestList = Collections.unmodifiableList(Arrays.asList("/gui/bootstrap/js/", "/gui/p3/js/", "/gui/p3/art/", "/gui/p3/css/", "/gui/banana/css/", "/gui/banana/vendor/", "/gui/p3/fonts/", "/gui/banana/help.js", "/gui/p3/app/components/", "/gui/banana/app/app.js", "/gui/banana/app/directives/", "/gui/banana/app/controllers/", "/gui/banana/app/services/", "/gui/banana/config.js", "/gui/banana/app/dashboards/", "/gui/banana/app/partials/", "/gui/banana/app/components/", "/gui/banana/app/panels/", "/gui/solr/p3coll", "/gui/banana/img/", "/gui/banana/logstash_logs","/gui/classic/"));

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException,
			ServletException {

		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		String requestUri = httpRequest.getRequestURI();

		if (requestUri != null && !verifyRequestURI(requestUri)) {

			DateFormat formatter = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.MEDIUM);
			String queryString = ((HttpServletRequest) request).getQueryString();
			HttpSession session = httpRequest.getSession();

			String referer = httpRequest.getHeader("referer");
			System.out.println("AccessCheck: referer  == " + referer);

			DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
			Date date = new Date();
			logger.debug("AccessCheck: Date and Time  == " + dateFormat.format(date)); // 2014/08/06 15:59:48

			System.out.println("AccessCheck: requestUri  == " + requestUri);
			System.out.println("AccessCheck: Session   == " + session);
			System.out.println("AccessCheck: session.getAttribute(CHECK_TOKEN) == " + session.getAttribute(CHECK_TOKEN));
			System.out.println("httpRequest.getContextPath() == " + httpRequest.getContextPath());
			String dataSource = (String) session.getAttribute("datasource");
			System.out.println("AccessCheck: DataSource " + dataSource);
			String datasource1 = httpRequest.getParameter("datasource");
			System.out.println("AccessCheck: Before Session Datasource " + datasource1);

			if ( datasource1 == null || datasource1.length() ==  0 ) {
				if ( dataSource != null ) {
					datasource1 = dataSource;
				}
			}

			String host = httpRequest.getHeader("Host");
			String hostBsp = httpRequest.getHeader("x-forwarded-host");

			String redirectUrl = "https://" + host;
			String redirectUrlBsp = "https://" + hostBsp;

			System.out.println("AccessCheck: host " + host);
			System.out.println("AccessCheck: redirectUrl " + redirectUrl);

			//Checking to see whether the user is already authenticated through OMB and access is denied
			if ( "YES".equals( session.getAttribute(ACCESS_DENIED) ) && requestUri.contains( "/gui/accessblocked.jsp" ) ) {
				session.removeAttribute(ACCESS_DENIED);
			} else if (session.getAttribute(CHECK_TOKEN) == null && (!requestUri.contains(httpRequest.getContextPath() + "/banana/"))) {

				System.out.println("AccessCheck: Crossed the first check");
				// Referer will be null in 2 cases
				// 1. When the login page is called.
				// 2. When index.html#/dashboard is called directly.
				if ( ((!requestUri.equals("/gui/")))) {
					// For main page just create a session
					// && (!requestUri.equals("/gui/banana/index.html") //If the
					// user comes without a session calling dashboard he should
					// be denied access
					if (!requestUri.contains("/gui/ReturnLoginViaMax") && !requestUri.equals("/gui/solutionfinder") && !requestUri.contains("/gui/#/dashboard?query=") && !requestUri.contains("/gui/?ticket=") ){
						System.out.println("AccessCheck: Access will be blocked");
						// FIXME DEBUG
						System.out.println("AccessCheck: call doesn't contain returnlogin or solutions finder or queryString");
						if (host != null && host.contains("acqit.helix.gsa.gov")) {
							httpResponse.sendRedirect(redirectUrlBsp + "/");
						}else{
							httpResponse.sendRedirect(redirectUrl + "/");
						}

						return;
					}

				}

				System.out.println("AccessCheck: Crossed the second check");

			} else if (session.getAttribute(CHECK_TOKEN) == null ) {
				// FIXME DEBUG
				System.out.println("AccessCheck: Blocked out!");
				if (host != null && host.contains("acqit.helix.gsa.gov")) {
					httpResponse.sendRedirect(redirectUrlBsp+"/gui/accessblocked.jsp");
				}else {
					httpResponse.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
				}

				return;

			}

			Date date1 = new Date(session.getLastAccessedTime());
			formatter = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.MEDIUM);
			System.out.println("AccessCheck: Session_1 Date and Time                     == " + dateFormat.format(date)); // 2014/08/06 15:59:48
			System.out.println("AccessCheck: Session_2 Session Last_Accessed_time = " + formatter.format(date1));

			System.out.println("AccessCheck: Session_3 Session Get_Max_inactive_interval = " + session.getMaxInactiveInterval());
		}
		chain.doFilter(request, response);

	}

	private boolean verifyRequestURI(String uri) {

		for (String requestURIPath: excludedRequestList) {

			if (uri.startsWith(requestURIPath)) {
				return true;
			}
		}

		return false;

	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
		// TODO Auto-generated method stub
	}

}
