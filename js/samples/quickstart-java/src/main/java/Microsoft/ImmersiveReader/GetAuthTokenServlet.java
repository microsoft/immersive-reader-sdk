package Microsoft.ImmersiveReader;

import io.github.cdimascio.dotenv.Dotenv;
import javax.servlet.http.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class GetAuthTokenServlet extends HttpServlet {

    private static Dotenv dotenv = Dotenv.load();

    private static String SUBSCRIPTION_KEY = dotenv.get("SUBSCRIPTION_KEY");
    private static String REGION = dotenv.get("REGION");

    public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
            throws IOException {

        if (isNullOrEmpty(SUBSCRIPTION_KEY) || isNullOrEmpty(REGION)) {
            throw new IllegalArgumentException("Azure Authentication information missing. Did you add " +
                    "SUBSCRIPTION_KEY and REGION to .env? See README.md");
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

        URL tokenUrl = new URL("https://" + REGION + ".api.cognitive.microsoft.com/sts/v1.0/issueToken");

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

    private static boolean isNullOrEmpty(String s) {
        return (s == null || s.isEmpty());
    }
}
