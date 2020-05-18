package p3;

import java.io.IOException;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class Logout extends HttpServlet {

	private Log logger= LogFactory.getLog(this.getClass());
	
	public void service(HttpServletRequest req, HttpServletResponse res)
			throws IOException, ServletException {
		
		HttpSession session = req.getSession();
		logger.debug("Before Invalidate Session");
		logger.debug("session.getAttribute(CHECK_TOKEN) == "
				+ session.getAttribute("P3Checked"));
		logger.debug("going to call session invalidate");
		session.invalidate();
		logger.debug("After Invalidate Session");
		String text = "LOGGED_OUT";
		res.setContentType("text/plain");  // Set content type of the response so that jQuery knows what it can expect.
	    res.setCharacterEncoding("UTF-8"); // You want world domination, huh?
	    
	    res.getWriter().write(text); 
	}
}
