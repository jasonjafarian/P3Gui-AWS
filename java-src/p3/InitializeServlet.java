package p3;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


public class InitializeServlet extends HttpServlet {

	private Log logger= LogFactory.getLog(this.getClass());
	public void init() throws ServletException
	{
		super.init();
		EbuyOpenHelper.setLhost(getInitParameter("ldapHost"));
		EbuyOpenHelper.setUtilid(getInitParameter("ldapBindUserId"));
		EbuyOpenHelper.setUtilpwd(getInitParameter("ldapBindPassword"));
		EbuyOpenHelper.setOmbmaxlink(getInitParameter("ombmaxlink"));
		EbuyOpenHelper.setOmbmaxredirectlink(getInitParameter("ombmaxredirectlink"));
		EbuyOpenHelper.setZipfileuploadlocation(getInitParameter("zipfileuploadlocation"));
		EbuyOpenHelper.setRestservername(getInitParameter("restservername"));
		EbuyOpenHelper.setRestservername2(getInitParameter("restservername2"));
		EbuyOpenHelper.setFileuploadserviceurl(getInitParameter("fileuploadserviceurl"));
		EbuyOpenHelper.setFileuploadauthurl(getInitParameter("fileuploadauthurl"));
		EbuyOpenHelper.setAuth(getInitParameter("ldapAuth"));
		EbuyOpenHelper.setDashboardLocation(getInitParameter("dashboardLocation"));
		System.out.println("EbuyOpenHelper dashboardlocation= " + EbuyOpenHelper.getDashboardLocation());
		EbuyOpenHelper.setPrimarySOLRServer(getInitParameter("primarySOLRServer"));
		EbuyOpenHelper.setSecondarySOLRServer(getInitParameter("secondarySOLRServer"));
		EbuyOpenHelper.setSolrCredentials(getInitParameter("solrCredentials"));
		logger.info("Parameters used by LdapAuthentication are set");
	}
}
