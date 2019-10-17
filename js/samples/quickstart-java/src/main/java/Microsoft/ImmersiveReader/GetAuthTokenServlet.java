package Microsoft.ImmersiveReader;

import io.github.cdimascio.dotenv.Dotenv;
import javax.servlet.http.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class GetAuthTokenServlet extends HttpServlet {

    public static Dotenv dotenv = Dotenv.load();

    public static String CLIENT_ID = dotenv.get("CLIENT_ID");
    public static String CLIENT_SECRET = dotenv.get("CLIENT_SECRET");
    public static String TENANT_ID = dotenv.get("TENANT_ID");
    public static String SUBDOMAIN = dotenv.get("SUBDOMAIN");

    public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
            throws IOException {

        if (TENANT_ID.isEmpty() || TENANT_ID == null) {
            throw new IllegalArgumentException();
        }

        if (CLIENT_ID.isEmpty() || CLIENT_ID == null) {
            throw new IllegalArgumentException();
        }

        if (CLIENT_SECRET.isEmpty() || CLIENT_SECRET == null) {
            throw new IllegalArgumentException();
        }

        if (SUBDOMAIN.isEmpty() || SUBDOMAIN == null) {
            throw new IllegalArgumentException();
        }

        String token = getToken();

        PrintWriter writer = httpServletResponse.getWriter();
        writer.write(token);
        writer.flush();
    }

    /**
     * Returns the token for the Immersive Reader
     *
     * @return the token for the Immersive Reader
     *
     */
    private String getToken() throws IOException {

        URL tokenUrl = new URL("https://login.windows.net/" + TENANT_ID + "/oauth2/token");
        String form = "grant_type=client_credentials&resource=https://cognitiveservices.azure.com/&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET;

        HttpURLConnection connection = (HttpURLConnection) tokenUrl.openConnection();
        connection.setRequestMethod("POST");

        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        connection.setDoOutput(true);
        DataOutputStream writer = new DataOutputStream(connection.getOutputStream());
        writer.writeBytes(form);
        writer.flush();
        writer.close();

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
