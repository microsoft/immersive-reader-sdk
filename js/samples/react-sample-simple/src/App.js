import React, { useEffect, useState } from "react";
import { launchAsync } from "@microsoft/immersive-reader-sdk"
require('dotenv').config() // load in env variables

function App() {

  const [token, setToken] = useState('');

  const styles = {
    immersive_reader_button: {
      marginTop: 25,
      float: 'right'
    }
  };

  const getCredentials = async () => {

    // Verify environment variables values
    if( !process.env.REACT_APP_CLIENT_ID ){
      console.log("ClientId is null! Did you add that info to .env file? See ReadMe.md.")
    }
    if( !process.env.REACT_APP_CLIENT_SECRET ){
      console.log("Client Secret is null! Did you add that info to .env file? See ReadMe.md.")
    }
    if( !process.env.REACT_APP_TENANT_ID ){
      console.log("TenantId is null! Did you add that info to .env file? See ReadMe.md.")
    }
    if( !process.env.REACT_APP_SUBDOMAIN ){
      console.log("Subdomain is null! Did you add that info to .env file? See ReadMe.md.")
    }

    // Form details to be passed to fetch
    const details = {
      grant_type: 'client_credentials',
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET,
      resource: 'https://cognitiveservices.azure.com/'
    };

    // Build up the form data -> it needs to be converted to a form type
    let formBodyArr = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBodyArr.push(encodedKey + "=" + encodedValue);
    }

    const formBodyStr = formBodyArr.join("&"); // This is what we can pass to the post request

    try {

      const response = await fetch(`http://localhost:3000/${process.env.REACT_APP_TENANT_ID}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBodyStr,
      });
      const json = await response.json();
      const { access_token } = json;
      setToken(access_token)

    }
    catch (err) {
      console.log({ err })
      alert('There was a problem fetching your credentials, please check the console and make sure your environment variables are prefixed with REACT_APP_');
    }
  }

  const launchReader = async () => {

    const data = {
      title: document.getElementById('ir-title').innerText,
      chunks: [{
        content: document.getElementById('ir-content').innerHTML,
        mimeType: "text/html"
      }]
    };

    // Learn more about options https://docs.microsoft.com/azure/cognitive-services/immersive-reader/reference#options
    const options = {
      "uiZIndex": 2000,
      "cookiePolicy": 1
    };

    try {
      await launchAsync(token, process.env.REACT_APP_SUBDOMAIN, data, options)
    }
    catch (error) {
      console.log(error);
      alert("Error in launching the Immersive Reader. Check the console.");
    }
  }

  // We use a react hook to fetch when the component is rendered (similar to componentDidMount)
  useEffect(() => {
    getCredentials();
  }, [])

  return (
    <div>
      <div id="iframeContainer"></div>
      <div className="container">
        <button className="immersive-reader-button" data-button-style="iconAndText" data-locale="en" style={styles.immersive_reader_button} onClick={launchReader}></button>
        <h1 id="ir-title">About Immersive Reader</h1>
        <div id="ir-content" lang="en-us">
          <div>
            <p>
              Immersive Reader is a tool that implements proven techniques to improve reading comprehension for emerging readers,
              language learners, and people with learning differences.
              The Immersive Reader is designed to make reading more accessible for everyone. The Immersive Reader
            </p>
            <ul>
              <li>
                Shows content in a minimal reading view
                </li>
              <li>
                Displays pictures of commonly used words
                </li>
              <li>
                Highlights nouns, verbs, adjectives, and adverbs
                </li>
              <li>
                Reads your content out loud to you
                </li>
              <li>
                Translates your content into another language
                </li>
              <li>
                Breaks down words into syllables
                </li>
            </ul>
          </div>
          <h3>
            The Immersive Reader is available in many languages.
        </h3>
          <p lang="es-es">
            El Lector inmersivo está disponible en varios idiomas.
        </p>
          <p lang="zh-cn">
            沉浸式阅读器支持许多语言
        </p>
          <p lang="de-de">
            Der plastische Reader ist in vielen Sprachen verfügbar.
        </p>
          <p lang="ar-eg" dir="rtl" style={{ textAlign: 'right' }}>
            يتوفر \"القارئ الشامل\" في العديد من اللغات.
        </p>
        </div>
      </div>
    </div>
  );
}

export default App;
