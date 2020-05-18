package p3;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class SolutionFinderService extends HttpServlet implements java.io.Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException, ServletException {
		String datasource = req.getParameter("datasource");
		System.out.println("Data Source Name****"+datasource);

		HttpSession session = req.getSession();
		
		Object accessChecked = session.getAttribute( AccessCheckFilter.CHECK_TOKEN );

		if(datasource!=null){
			session.setAttribute("datasource", datasource);
			
			if ( accessChecked != null ) {
				res.sendRedirect("/gui/banana/dashboard-include.jsp?datasource="+datasource);
			} else {
				res.sendRedirect( EbuyOpenHelper.getOmbmaxlink() );
			}
		}else{
			if ( accessChecked != null ) {
				res.sendRedirect("/gui/banana/dashboard-include.jsp");
			} else {
				res.sendRedirect( EbuyOpenHelper.getOmbmaxlink() );
			}
		}
		
	}
	

}
