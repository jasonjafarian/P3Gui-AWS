package p3;

import java.util.Properties;
import java.util.Enumeration;
import javax.naming.NamingEnumeration;
import javax.naming.directory.SearchControls;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchResult;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class EbuyOpenHelper {

	private static final Log logger = LogFactory.getLog(EbuyOpenHelper.class);

	/*
	 * * Authentication service entry point
	 */
	private static String lhost;
	private static String utilid;
	private static String utilpwd;
	private static String auth;
	private static String dashboardLocation;
	private static String ombmaxlink;
	private static String ombmaxredirectlink;
	private static String restservername;
	private static String restservername2;
	private static String fileuploadserviceurl;
	private static String fileuploadauthurl;
	private static String zipfileuploadlocation;
	private static String primarySOLRServer;
	private static String secondarySOLRServer;
	private static String solrCredentials;

	public static final String eBuyOpenCookie = "ebuy_open_agreed";
	public static final String readyForDashboard = "readyfordashboard";
	public static final String loginDone = "loginDone";

	public static String getZipfileuploadlocation() {
		return zipfileuploadlocation;
	}

	public static void setZipfileuploadlocation(String zipfileuploadlocation) {
		EbuyOpenHelper.zipfileuploadlocation = zipfileuploadlocation;
	}

	public static String getFileuploadserviceurl() {
		return fileuploadserviceurl;
	}

	public static void setFileuploadserviceurl(String fileuploadserviceurl) {
		EbuyOpenHelper.fileuploadserviceurl = fileuploadserviceurl;
	}

	public static String getFileuploadauthurl() {
		return fileuploadauthurl;
	}

	public static void setFileuploadauthurl(String fileuploadauthurl) {
		EbuyOpenHelper.fileuploadauthurl = fileuploadauthurl;
	}

	public static String getRestservername() {
		return restservername;
	}

	public static void setRestservername(String restservername) {
		EbuyOpenHelper.restservername = restservername;
	}

	public static String getRestservername2() {
                return restservername2;
        }

        public static void setRestservername2(String restservername2) {
                EbuyOpenHelper.restservername2 = restservername2;
        }


	public static String getOmbmaxredirectlink() {
		return ombmaxredirectlink;
	}



	public static void setOmbmaxredirectlink(String ombmaxredirectlink) {
		EbuyOpenHelper.ombmaxredirectlink = ombmaxredirectlink;
	}

	public static String getOmbmaxlink() {
		return ombmaxlink;
	}

	public static void setOmbmaxlink(String ombmaxlink) {
		EbuyOpenHelper.ombmaxlink = ombmaxlink;
	}

	public static String getLhost() {
		return lhost;
	}

	public static void setLhost(String lhost) {
		EbuyOpenHelper.lhost = lhost;
	}

	public static String getUtilid() {
		return utilid;
	}

	public static void setUtilid(String utilid) {
		EbuyOpenHelper.utilid = utilid;
	}

	public static String getUtilpwd() {
		return utilpwd;
	}

	public static void setUtilpwd(String utilpwd) {
		EbuyOpenHelper.utilpwd = utilpwd;
	}

	public static String getAuth() {
		return auth;
	}

	public static void setAuth(String auth) {
		EbuyOpenHelper.auth = auth;
	}

	public static String getDashboardLocation() {
		return dashboardLocation;
	}

	public static void setDashboardLocation(String dashboardLocation) {
		EbuyOpenHelper.dashboardLocation = dashboardLocation;
	}

	public static String getPrimarySOLRServer() {
		return primarySOLRServer;
	}

	public static void setPrimarySOLRServer(String primarySOLRServer) {
		EbuyOpenHelper.primarySOLRServer = primarySOLRServer;
	}

	public static String getSecondarySOLRServer() {
		return secondarySOLRServer;
	}

	public static void setSecondarySOLRServer(String secondarySOLRServer) {
		EbuyOpenHelper.secondarySOLRServer = secondarySOLRServer;
	}

	public static String getSolrCredentials() {
		return solrCredentials;
	}

	public static void setSolrCredentials(String solrCredentials) {
		EbuyOpenHelper.solrCredentials = solrCredentials;
	}

}
