package com.example.immersivereadersdk;

import android.text.TextUtils;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import static java.net.HttpURLConnection.HTTP_OK;

// This sample app uses the Dotenv is a module that loads environment variables from a .env file to better manage secrets.
// https://github.com/cdimascio/java-dotenv
// Be sure to add a "env" file to the /assets folder
// instead of '.env', use 'env'

public class IRAuthenticator implements ImmersiveReader.IAuthenticator {
    private static final String LOG_TAG = "IRAuthenticator";
    Dotenv dotEnv = Dotenv.configure()
            .directory("/assets")
            .filename("env")
            .ignoreIfMalformed()
            .ignoreIfMissing()
            .load();

    @Override
    public String getAccessToken() {
        String subscriptionKey = dotEnv.get("SUBSCRIPTION_KEY");
        String region = dotEnv.get("REGION");
        String accessToken = null;

        try {
            StringBuilder urlStringBuilder = new StringBuilder();
            urlStringBuilder.append("https://");
            urlStringBuilder.append(region);
            urlStringBuilder.append(".api.cognitive.microsoft.com/sts/v1.0/issueToken");
            URL tokenUrl = new URL(urlStringBuilder.toString());

            HttpURLConnection httpURLConnection = (HttpURLConnection) tokenUrl.openConnection();
            httpURLConnection.setRequestMethod("POST");
            httpURLConnection.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
            httpURLConnection.setRequestProperty("Content-length", "0");
            httpURLConnection.setRequestProperty("Ocp-Apim-Subscription-Key", subscriptionKey);
            httpURLConnection.setDoOutput(true);

            DataOutputStream dataOutputStream = new DataOutputStream(httpURLConnection.getOutputStream());
            dataOutputStream.flush();
            dataOutputStream.close();

            int responseCode = httpURLConnection.getResponseCode();

            if (responseCode == HTTP_OK) {
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream()));
                StringBuffer response = new StringBuffer();


                String line = bufferedReader.readLine();
                while (!TextUtils.isEmpty(line)) {
                    response.append(line);
                    line = bufferedReader.readLine();
                }

                bufferedReader.close();

                accessToken = response.toString();
            }

        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        //  accessToken = Constants.ACCESS_TOKEN;
        Log.i(LOG_TAG, "Accesstoken: " + accessToken);
        return accessToken;
    }
}
