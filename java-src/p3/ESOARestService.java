package p3;

import java.io.File;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.DatatypeConverter;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.multipart.FormDataMultiPart;
import com.sun.jersey.multipart.file.FileDataBodyPart;

public class ESOARestService {

	private static Log logger= LogFactory.getLog(ESOARestService.class);
	
	public static ClientResponse esoaservice(String filename, String username,
			String pd) throws ServletException, java.io.IOException {
		Client client = Client.create();

		WebResource webResource = client.resource(EbuyOpenHelper
				.getFileuploadserviceurl());
		InputStream fileInStream = null;
		
		logger.debug("EbuyOpenHelper.getZipfileuploadlocation() = "
				+ EbuyOpenHelper.getZipfileuploadlocation());
		logger.debug("Inside ESOARestService ");		
		logger.debug("Inside ESOARestService filename = " + filename);		
		logger.debug("Inside ESOARestService username = " + username);		
		logger.debug("Inside ESOARestService password = " + pd);
		String fileName = EbuyOpenHelper.getZipfileuploadlocation() + filename
				+ ".gz";

		String authString = username + ":" + pd;
		//String authStringEnc = new BASE64Encoder().encode(authString.getBytes());
		String authStringEnc = DatatypeConverter.printBase64Binary(authString.getBytes());
		FormDataMultiPart form = new FormDataMultiPart();

		final File fileToUpload = new File(fileName);
		final FormDataMultiPart multiPart = new FormDataMultiPart();
		multiPart.bodyPart(new FileDataBodyPart("file", fileToUpload,
				MediaType.APPLICATION_OCTET_STREAM_TYPE));

		ClientResponse serviceresponse = webResource
				.type(MediaType.MULTIPART_FORM_DATA_TYPE)
				.header("Authorization", "Basic " + authStringEnc)
				.post(ClientResponse.class, multiPart);
		logger.debug("ESOARESTSERVICE call over");
		logger.debug("response-getstatus() = "
		+ serviceresponse.getStatus());
		logger.debug("response-getconten() = "
		+ serviceresponse.getEntity(String.class));

		// System.out.println("Webservice call over = " + response);
		// Gson gson = new Gson();

		// Result result = gson.fromJson(response, Result.class);
		return serviceresponse;

	}

}
