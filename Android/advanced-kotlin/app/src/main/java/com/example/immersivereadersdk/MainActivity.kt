// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package com.example.immersivereadersdk

import android.app.Activity
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebView
import android.widget.Button
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.TextView
import com.google.gson.*
import io.github.cdimascio.dotenv.dotenv
import java.io.IOException
import java.io.*
import java.net.HttpURLConnection
import java.net.HttpURLConnection.HTTP_OK
import java.net.URL
import kotlinx.coroutines.*
import org.json.JSONObject
import java.util.*


// This sample app uses the Dotenv is a module that loads environment variables from a .env file to better manage secrets.
// https://github.com/cdimascio/java-dotenv
// Be sure to add a "env" file to the /assets folder
// instead of '.env', use 'env'


class MainActivity : AppCompatActivity() {

    private val dotEnv = dotenv {
        directory = "/assets"
        filename = "env"
        ignoreIfMalformed = true
        ignoreIfMissing = true
    }

    private lateinit var contextualWebView: WebView
    private lateinit var messageData: Message

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        this.supportActionBar!!.hide()
        setContentView(R.layout.activity_main)
        val immersiveReaderButton = findViewById<Button>(R.id.LaunchImmersiveReaderButton)
        immersiveReaderButton.setOnClickListener { GlobalScope.launch { handleLoadImmersiveReaderWebView() } }
    }

    private suspend fun handleLoadImmersiveReaderWebView() {
        val exampleActivity = this
        val subdomain = dotEnv["SUBDOMAIN"]
        val irTitle = findViewById<TextView>(R.id.Title)
        val irText = findViewById<TextView>(R.id.Content)
        val chunk = Chunk(irText.text.toString(), "en", "text/plain")
        val chunks = listOf(chunk)
        val data = Content(irTitle.text.toString(), chunks)
        val appUtilities = AppUtilities(exampleActivity)

        // Options passed to the Immersive Reader
        val allowFullscreen = true
        val customDomain = ""
        val hideExitButton = false
        val onExit = appUtilities::exitCallback
        val uiLang = "en"
        val uiZIndex = 0
        val timeoutInMilliseconds = 15000
        val options = Options(uiLang, timeoutInMilliseconds, uiZIndex, onExit, customDomain, allowFullscreen, hideExitButton)

        var token: String

        runBlocking{
            val resp = async { getImmersiveReaderTokenAsync() }
            token = resp.await()
            val jsonResp = JSONObject(token)
            loadImmersiveReaderWebView(exampleActivity, jsonResp.getString("access_token"), subdomain, data, options)
        }
    }

    private suspend fun getImmersiveReaderTokenAsync(): String {
        return getToken()
    }

    @Throws(IOException::class)
    fun getToken(): String {
        val clientId = dotEnv["CLIENT_ID"]
        val clientSecret = dotEnv["CLIENT_SECRET"]
        val tenantId = dotEnv["TENANT_ID"]
        val tokenUrl = URL("https://login.windows.net/$tenantId/oauth2/token")
        val form = "grant_type=client_credentials&resource=https://cognitiveservices.azure.com/&client_id=$clientId&client_secret=$clientSecret"

        val connection = tokenUrl.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("content-type", "application/x-www-form-urlencoded")
        connection.doOutput = true

        val writer = DataOutputStream(connection.outputStream)
        writer.writeBytes(form)
        writer.flush()
        writer.close()

        val responseCode = connection.responseCode

        if (responseCode == HTTP_OK) {
            val readerIn = BufferedReader(InputStreamReader(connection.inputStream))
            var inputLine = readerIn.readLine()
            val response = StringBuffer()

            do {
                response.append(inputLine)
            } while (inputLine.length < 0)
            readerIn.close()

            // Return token
            return response.toString()
        } else {
            val responseError = Error(code = "BadRequest", message = "There was an error getting the token.")
            throw IOException(responseError.toString())
        }
    }

    // TODO: Move data classes to be consumed via @JavaScriptInterface.
    //   Once the data classes are used in this way users need only deserialize them for use in their projects.
    //   This will make things easier to read and maintain.
    data class Content(var title: String,
                       var chunks: List<Chunk>)

    data class Chunk(var content: String,
                     var lang: String,
                     var mimeType: String)

    // Only includes Immersive Reader options relevant to Android apps.
    // For a complete list see https://github.com/microsoft/immersive-reader-sdk/blob/master/js/src/options.ts
    data class Options(var uiLang: String, // Language of the UI, e.g. en, es-ES (optional). Defaults to browser language if not specified.
                       var timeout: Int, // Duration (in milliseconds) before launchAsync fails with a timeout error (default is 15000 ms).
                       var uiZIndex: Int, // Z-index of the iframe that will be created (default is 1000)
                       var onExit: (() -> Any)?, // Executes when the Immersive Reader exits
                       var customDomain: String, // Reserved for internal use. Custom domain where the Immersive Reader webapp is hosted (default is null).
                       var allowFullscreen: Boolean, // The ability to toggle fullscreen (default is true).
                       var hideExitButton: Boolean // Whether or not to hide the Immersive Reader's exit button arrow (default is false). This should only be true if there is an alternative mechanism provided to exit the Immersive Reader (e.g a mobile toolbar's back arrow).
    )

    data class Error(var code: String,
                     var message: String)

    data class Message(var cogSvcsAccessToken: String?,
                       var cogSvcsSubdomain: String?,
                       var request: Content,
                       var launchToPostMessageSentDurationInMs: Int,
                       var options: Options)

    @Throws(IOException::class)
    fun loadImmersiveReaderWebView(
        exampleActivity: Activity,
        token: String?,
        subdomain: String?,
        content: Content,
        options: Options) {
        if (token === "") {
            val badArgumentError = Error(code = "BadArgument", message = "Token must not be empty.")
            throw IOException(badArgumentError.toString())
        }
        if (subdomain === "") {
            val badArgumentError = Error(code = "BadArgument", message = "Subdomain must not be empty.")
            throw IOException(badArgumentError.toString())
        }
        if (content.chunks.isEmpty()) {
            val badArgumentError = Error(code = "BadArgument", message = "Chunks must not be empty.")
            throw IOException(badArgumentError.toString())
        }

        val startPostMessageSentDurationInMs = Date()

        // Create the message variable
        messageData = Message(token, subdomain, content, 0, options)

        GlobalScope.launch {
            withContext(Dispatchers.Main) {
                contextualWebView = WebView(exampleActivity)
                val parentLayout = findViewById<LinearLayout>(R.id.linearLayout)
                val contextualWebViewSettings = contextualWebView.settings

                contextualWebViewSettings.allowContentAccess = true
                contextualWebViewSettings.builtInZoomControls = true
                contextualWebViewSettings.javaScriptEnabled = true
                contextualWebViewSettings.loadsImagesAutomatically = true
                contextualWebViewSettings.loadWithOverviewMode = true
                contextualWebViewSettings.useWideViewPort = true
                contextualWebViewSettings.userAgentString = "Android"
                contextualWebViewSettings.domStorageEnabled = true

                contextualWebViewSettings.setAppCacheEnabled(false)
                contextualWebViewSettings.setSupportZoom(true)
                contextualWebView.setInitialScale(1)

                // Enables WebView Cookies
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                    CookieManager.getInstance().setAcceptThirdPartyCookies(contextualWebView, true)
                } else {
                    CookieManager.getInstance().setAcceptCookie(true)
                }

                val contextualWebViewLayout = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT)
                parentLayout.addView(contextualWebView, 0, contextualWebViewLayout)

                // This is required to launch the WebView *inside* the host application.
                contextualWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                        view.loadUrl(url)
                        return true
                    }

                    // Send message JSON object to Immersive Reader html
                    override fun onPageFinished(view: WebView, url: String) {
                        val endPostMessageSentDurationInMs = Date()
                        val postMessageSentDurationInMs = (endPostMessageSentDurationInMs.time - startPostMessageSentDurationInMs.time).toInt()

                        // Updates launchToPostMessageSentDurationInMs
                        messageData.launchToPostMessageSentDurationInMs = postMessageSentDurationInMs

                        // Serializes message data class to JSON
                        val gson = Gson()
                        val message = gson.toJson(messageData)

                        // Calls the handleLaunchImmersiveReader function in HTML
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                            view.evaluateJavascript("handleLaunchImmersiveReader($message)", null)
                        } else {
                            view.loadUrl("javascript:handleLaunchImmersiveReader($message)")
                        }

                        // Sets the visibility of the WebView after the function has been called.
                        view.visibility = WebView.VISIBLE
                    }
                }

                val jsInterface = WebAppInterface(exampleActivity, parentLayout, contextualWebView, messageData)
                contextualWebView.addJavascriptInterface(jsInterface, "Android")
                contextualWebView.loadUrl("file:///android_asset/immersiveReader.html")
            }
        }
    }
}
