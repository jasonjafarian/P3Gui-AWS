package p3;

import java.io.IOException;

import java.util.Iterator;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.jasig.cas.client.authentication.AttributePrincipal;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class CheckSession extends HttpServlet {

	private Log logger = LogFactory.getLog(this.getClass());

	public void service(HttpServletRequest req, HttpServletResponse res)
			throws IOException, ServletException {
		
		HttpSession session = req.getSession();
		logger.debug("Check Session = " + session);
		String text = "";
		if (session == null){
			text = "TIMED_OUT";
		}
		
		res.setContentType("text/plain");  // Set content type of the response so that jQuery knows what it can expect.
	    res.setCharacterEncoding("UTF-8"); // You want world domination, huh?
	    res.getWriter().write(text); 
	}
}
