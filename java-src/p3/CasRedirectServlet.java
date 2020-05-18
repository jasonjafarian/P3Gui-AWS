package p3;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class CasRedirectServlet extends HttpServlet{
    /**
     *
     */
    private static final long serialVersionUID = 1L;
    private static final Log logger = LogFactory.getLog(CasRedirectServlet.class);
    public void service(HttpServletRequest req, HttpServletResponse res)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) req;
        HttpServletResponse httpResponse = (HttpServletResponse) res;
        String queryString = req.getParameter("query");
        System.out.println("CasRedirect: queryString =  " + queryString);
        System.out.println("CasRedirect: URL =  " + req.getRemoteHost());
        String requestUri = httpRequest.getRequestURI();
        HttpSession session = httpRequest.getSession();

        System.out.println("CasRedirect: Context path = " + httpRequest.getContextPath());
        System.out.println("CasRedirect: referer  == "
                + httpRequest.getHeader("referer"));
        System.out.println("CasRedirect: requestUri == " + requestUri);
        String ticket = req.getParameter("ticket");
        System.out.println("CasRedirect: p3-ticket = " + ticket);

        String host = httpRequest.getHeader("Host");
        String hostBsp = httpRequest.getHeader("x-forwarded-host");

        String redirectUrl = "https://" + host;
        String redirectUrlBsp = "https://" + hostBsp;
        System.out.println("CasRedirect: Host = " + host);


        String cas_validate;
        if (host != null && host.contains("acqit.helix.gsa.gov")) {
            System.out.println("CasRedirect: inside cas_val Host = " + host);
            cas_validate = "https://login.test.max.gov/cas/serviceValidate?ticket=" + ticket + "&service=" + EbuyOpenHelper.getOmbmaxredirectlink();
            // FIXME might be a weird null check
            if (queryString != null) {
                cas_validate = "https://login.test.max.gov/cas/serviceValidate?ticket=" + ticket + "&service=" + EbuyOpenHelper.getOmbmaxredirectlink() + "?query=" + queryString;
            }
        } else {
            cas_validate = "https://login.max.gov/cas/serviceValidate?ticket=" + ticket + "&service=" + EbuyOpenHelper.getOmbmaxredirectlink();
            // FIXME might be a weird null check
            if (queryString != null) {
                cas_validate = "https://login.max.gov/cas/serviceValidate?ticket=" + ticket + "&service=" + EbuyOpenHelper.getOmbmaxredirectlink() + "?query=" + queryString;
            }
        }
        System.out.println("CasRedirect: cas_validate string = " + cas_validate);
        Client client = Client.create();

        WebResource webResource = client.resource(cas_validate);
        ClientResponse response = webResource.get(ClientResponse.class);
        System.out.println("CasRedirect: Status " + response.getStatus());
        String casresponse = response.getEntity(String.class);
        String User = parse_tag(casresponse, "cas:user");
        String saml = parse_tag(casresponse, "maxAttribute:samlAuthenticationStatementAuthMethod");
        String loa = parse_tag(casresponse, "maxAttribute:EAuth-LOA");
        String group = parse_tag(casresponse, "maxAttribute:GroupList");
        String user_classification = parse_tag(casresponse, "maxAttribute:User-Classification");

        System.out.println("CasRedirect: User = " + User);
        System.out.println("CasRedirect: Saml = " + saml);
        System.out.println("CasRedirect: loa = " + loa);
        System.out.println("CasRedirect: group = " + group);
        System.out.println("CasRedirect: User_classification = " + user_classification);

        System.out.println("CasRedirect: Completed");
        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        Date date = new Date();
        logger.debug("CasRedirect: Date and Time  == " + dateFormat.format(date));

	String datasource = (String) session.getAttribute("datasource");
	logger.info("CasRedirect: datasource = " + datasource );
		
	String datasourceQueryString = "";
		
	if ( datasource != null && datasource.length() > 0 ) {
		datasourceQueryString = "?datasource=" + datasource;
		session.removeAttribute("datasource");
	}
	

        Boolean pivUser = saml.contains("urn:max:fips-201-pivcard")
                && user_classification.contains("FEDERAL");

	Boolean mfaUser = saml.contains("urn:max:am:secureplus:MobileTwoFactorUnregistered:assurancelevel3")
				&& user_classification.contains("FEDERAL");
	
	Boolean federatedUser = saml.contains("urn:max:am:secureplus:federated-saml2:assurancelevel3") 
				&& user_classification.contains("FEDERAL");

	logger.info( "CasRedirect: Multifactor Authentication = " + mfaUser );

	Boolean contractor = user_classification.contains("CONTRACTOR");

        Boolean p3Admin = group.contains("AGY-GSA-FAS.PRICESPAID.ADMIN");

        Boolean p3DevUser = group.contains("AGY-GSA-FAS.PRICESPAID-P3.AUTHORIZED.USERS.DEV");

        Boolean p3TestUser = group.contains("AGY-GSA-FAS.PRICESPAID-P3.AUTHORIZED.USERS.TEST");

        Boolean p3StagingUser = group.contains("AGY-GSA-FAS.PRICESPAID-P3.AUTHORIZED.USERS.STAGING");
	
        Boolean p3ProdUser = group.contains("AGY-GSA-FAS.PRICESPAID-AGY-GSA-FAS.PRICESPAID-P3.AUTHORIZED.USERS.PROD");

        // User is authenticated via PIV/CAC
        if (host != null && host.contains("acqit.helix.gsa.gov")) {
            if (p3Admin) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3Admin");
                if (queryString != null) {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (p3DevUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3DevUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (p3TestUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3TestUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (p3StagingUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3StagingUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (pivUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with pivUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrlBsp + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            }
            // User is not authenticated, redirect them to the authentication warning page.
            else {
                System.out.println("CasRedirect: Blocked out!");
                res.sendRedirect(redirectUrlBsp+"/gui/accessblocked.jsp");
                req.setAttribute("validation", "NOT-VALIDATED");
                req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                System.out.println("Invalidated" + session.getAttribute("P3Checked"));
            }


        }else{

	    if ( redirectUrl.contains("p3.cap.gsa.gov") ) {
		if ( pivUser || mfaUser || federatedUser ) {
			session.setAttribute( AccessCheckFilter.CHECK_TOKEN, AccessCheckFilter.CHECK_TOKEN );
			if ( datasourceQueryString != null ) {
				res.sendRedirect( "https://p3.cap.gsa.gov/gui/banana/dashboard-include.jsp" + datasourceQueryString + "#dashboard" );	
			} else if (queryString != null) {
                    		res.sendRedirect( "https://p3.cap.gsa.gov/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    		return;
               	 	} else {
                    		res.sendRedirect( "https://p3.cap.gsa.gov/gui/banana/dashboard-include.jsp");
                    		return;
               	 	}
		} else if ( contractor ) {
			if ( p3Admin || p3ProdUser ) {
				session.setAttribute( AccessCheckFilter.CHECK_TOKEN, AccessCheckFilter.CHECK_TOKEN );
				if ( datasourceQueryString != null ) {
                                	res.sendRedirect( "https://p3.cap.gsa.gov/gui/banana/dashboard-include.jsp" + datasourceQueryString + "#dashboard" );
                        	} else if (queryString != null) {
                         	       res.sendRedirect( "https://p3.cap.gsa.gov/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                                	return;
                        	} else {
                                	res.sendRedirect( "https://p3.cap.gsa.gov/gui/banana/dashboard-include.jsp");
                                	return;
                       		 }
			} else {
				System.out.println("CasRedirect: Blocked out!");
				session.setAttribute( AccessCheckFilter.ACCESS_DENIED, "YES" );
				session.removeAttribute( AccessCheckFilter.CHECK_TOKEN );
                        	res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                        	req.setAttribute("validation", "NOT-VALIDATED");
                        	req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                        	System.out.println("Invalidated" + session.getAttribute("P3Checked"));
			}
		} else {
			System.out.println("CasRedirect: Blocked out!");
			session.setAttribute( AccessCheckFilter.ACCESS_DENIED, "YES" );
			session.removeAttribute( AccessCheckFilter.CHECK_TOKEN );
                	res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                	req.setAttribute("validation", "NOT-VALIDATED");
                	req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                	System.out.println("Invalidated" + session.getAttribute("P3Checked"));	
		}	

	    } else if ( redirectUrl.contains("p3-staging.cap.gsa.gov" ) ) {
			if ( p3StagingUser ) {
				session.setAttribute( AccessCheckFilter.CHECK_TOKEN, AccessCheckFilter.CHECK_TOKEN );
				if ( datasourceQueryString != null ) {
                                	res.sendRedirect( "https://p3-staging.cap.gsa.gov/gui/banana/dashboard-include.jsp" + datasourceQueryString + "#dashboard" );
                        	} else if (queryString != null) {
                                       res.sendRedirect( "https://p3-staging.cap.gsa.gov/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                                        return;
                                } else {
                                        res.sendRedirect( "https://p3-staging.cap.gsa.gov/gui/banana/dashboard-include.jsp");
                                        return;
                                 }
                        } else {
				System.out.println("CasRedirect: Blocked out!");
				session.setAttribute( AccessCheckFilter.ACCESS_DENIED, "YES" );
				session.removeAttribute( AccessCheckFilter.CHECK_TOKEN );
                        	res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                        	req.setAttribute("validation", "NOT-VALIDATED");
                        	req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                        	System.out.println("Invalidated" + session.getAttribute("P3Checked"));
			}

	   } else if ( redirectUrl.contains("p3-test.cap.gsa.gov" ) ) {
			if ( p3TestUser ) {
				session.setAttribute( AccessCheckFilter.CHECK_TOKEN, AccessCheckFilter.CHECK_TOKEN );
				if ( datasourceQueryString != null ) {
                                	res.sendRedirect( "https://p3-test.cap.gsa.gov/gui/banana/dashboard-include.jsp" + datasourceQueryString + "#dashboard" );
                        	} else  if (queryString != null) {
                                       res.sendRedirect( "https://p3-test.cap.gsa.gov/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                                        return;
                                } else {
                                        res.sendRedirect( "https://p3-test.cap.gsa.gov/gui/banana/dashboard-include.jsp");
                                        return;
                                 }
                        } else {
                                System.out.println("CasRedirect: Blocked out!");
				session.setAttribute( AccessCheckFilter.ACCESS_DENIED, "YES" );
				session.removeAttribute( AccessCheckFilter.CHECK_TOKEN );
                                res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                                req.setAttribute("validation", "NOT-VALIDATED");
                                req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                                System.out.println("Invalidated" + session.getAttribute("P3Checked"));
                        }


	  } else if ( redirectUrl.contains( "p3-dev.cap.gsa.gov" ) ) {
			if ( p3DevUser ) {
				session.setAttribute( AccessCheckFilter.CHECK_TOKEN, AccessCheckFilter.CHECK_TOKEN );
				if ( datasourceQueryString != null ) {
                                	res.sendRedirect( "https://p3-dev.cap.gsa.gov/gui/banana/dashboard-include.jsp" + datasourceQueryString + "#dashboard" );
                        	} else if (queryString != null) {
                                       res.sendRedirect( "https://p3-dev.cap.gsa.gov/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                                        return;
                                } else {
                                        res.sendRedirect( "https://p3-dev.cap.gsa.gov/gui/banana/dashboard-include.jsp");
                                        return;
                                 }
                        } else {
                                System.out.println("CasRedirect: Blocked out!");
				session.setAttribute( AccessCheckFilter.ACCESS_DENIED, "YES" );
				session.removeAttribute( AccessCheckFilter.CHECK_TOKEN );
                                res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                                req.setAttribute("validation", "NOT-VALIDATED");
                                req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                                System.out.println("Invalidated" + session.getAttribute("P3Checked"));
                        }

	 } else {
			System.out.println("CasRedirect: Blocked out!");
			session.setAttribute( AccessCheckFilter.ACCESS_DENIED, "YES" );
			session.removeAttribute( AccessCheckFilter.CHECK_TOKEN );
                        res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                        req.setAttribute("validation", "NOT-VALIDATED");
                        req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                        System.out.println("Invalidated" + session.getAttribute("P3Checked"));

	}


/*
            if (p3Admin) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3Admin");
                if (queryString != null) {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (p3DevUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3DevUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (p3TestUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3TestUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (p3StagingUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with p3StagingUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            } else if (pivUser) {
                System.out.println("CasRedirect: Valid User via PIV/CAC");
                System.out.println("CasRedirect: Query string detected with pivUser");
                if (queryString != null) {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp#/dashboard?query=" + queryString);
                    return;
                } else {
                    res.sendRedirect(redirectUrl + "/gui/banana/dashboard-include.jsp");
                    return;
                }
            }
            // User is not authenticated, redirect them to the authentication warning page.
            else {
                System.out.println("CasRedirect: Blocked out!");
                res.sendRedirect(redirectUrl+"/gui/accessblocked.jsp");
                req.setAttribute("validation", "NOT-VALIDATED");
                req.setAttribute("msg", "Access Denied: You must be a Federal employee and use a PIV/CAC Card to access this application. Please go to OMB MAX ,logout, and then login using your PIV/CAC card.");
                System.out.println("Invalidated" + session.getAttribute("P3Checked"));
            }
*/

        }
    }
    /*
      Used for parsing xml.  Search str for first occurance of
      <tag>.....</tag> and return text (striped of leading and
      trailing whitespace) between tags.  Return "" if tag not
      found.
    */
    public static String parse_tag(String str,String tag){
        int tag1_pos1 = str.indexOf("<"+tag);

        if (tag1_pos1 == -1){
            return "";
        }

        int tag1_pos2 = str.indexOf(">",tag1_pos1);


        if (tag1_pos2 == -1){
            return "";
        }

        int tag2_pos1 = str.indexOf("</"+tag,tag1_pos2);

        if (tag2_pos1 == -1){
            return "";
        }


        return str.substring(tag1_pos2+1, tag2_pos1);
    }
}
