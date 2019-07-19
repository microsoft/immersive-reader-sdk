package Microsoft.ImmersiveReader;

import javax.servlet.http.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

import static Microsoft.ImmersiveReader.Constants.SUBSCRIPTION_KEY;
import static Microsoft.ImmersiveReader.Constants.ENDPOINT_URL;

public class GetAuthTokenServlet extends HttpServlet {

    public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
            throws IOException {

        if (SUBSCRIPTION_KEY.isEmpty() || SUBSCRIPTION_KEY == null) {
            throw new IllegalArgumentException();
        }

        if (ENDPOINT_URL.isEmpty() || ENDPOINT_URL == null) {
            throw new IllegalArgumentException();
        }

        String token = getToken();

        PrintWriter writer = httpServletResponse.getWriter();
        writer.write(token);
        writer.flush();
    }

    /**
     * Returns the token for the Immersive Reader by using the Azure Subscription Key
     *
     * @return the token for the Immersive Reader by using the Azure Subscription Key
     *
     */
    private String getToken() throws IOException {

        URL tokenUrl = new URL(ENDPOINT_URL + "/issueToken");

        HttpURLConnection connection = (HttpURLConnection) tokenUrl.openConnection();
        connection.setRequestMethod("POST");

        connection.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
        connection.setRequestProperty("Content-length", "0");
        connection.setRequestProperty("Ocp-Apim-Subscription-Key", SUBSCRIPTION_KEY);

        connection.setDoOutput(true);
        OutputStream os = connection.getOutputStream();
        os.close();

        int responseCode = connection.getResponseCode();

        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader readerIn = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = readerIn.readLine()) != null) {
                response.append(inputLine);
            }
            readerIn.close();

            // Return token
            return response.toString();
        } else {
            throw new IOException();
        }
    }
}
