package p3;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.cas.client.authentication.AttributePrincipal;


public class CasLogFilter implements Filter {
 
	private static final Log logger=LogFactory.getLog(CasLogFilter.class);
   
	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		
		HttpServletRequest httpRequest=(HttpServletRequest)request;
		HttpServletResponse httpResponse=(HttpServletResponse)response;
		HttpSession session=httpRequest.getSession();
		String userAgent=httpRequest.getHeader("user-agent");
		String requestUri=httpRequest.getRequestURI();
		if (session.getAttribute("logged")==null) {
			AttributePrincipal principal = (AttributePrincipal)httpRequest.getUserPrincipal();
			//logger.info("CAS User "+ httpRequest.getRemoteUser()+" logged in and is accessing banana dashboard. session="+session.getId()+" requestUri="+requestUri);
			if (principal!=null) {
				Map attributes = principal.getAttributes(); 
				Iterator attributeNames = attributes.keySet().iterator();
				for (; attributeNames.hasNext();) {
				  String attributeName = (String) attributeNames.next();
			      Object attributeValue = attributes.get(attributeName);
			      logger.info(attributeName+"="+attributeValue);
				}
			}
			session.setAttribute("logged", "YES");			
		}
	    httpResponse.addHeader("X-UA-Compatible", "IE=edge");
		chain.doFilter(request, response);
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