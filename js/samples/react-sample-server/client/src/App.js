import React, { useEffect, useState } from "react";
import { launchAsync } from "@microsoft/immersive-reader-sdk"

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */
const styles = {
  immersive_reader_button: {
    marginTop: 25,
    float: 'right'
  }
};

function exitCallback() {
  alert("This is the callback function. It is executed when the Immersive Reader closes.");
}

// Learn more about options https://docs.microsoft.com/azure/cognitive-services/immersive-reader/reference#options
const options = {
  "uiZIndex": 2000,
  "cookiePolicy": 1,
  "onExit": exitCallback
};
/* -------------------------------------------------------------------------- */

function App() {

  /* ----------------------------- State Variables ---------------------------- */
  const [token, setToken] = useState('');
  const [subdomain, setSubdomain] = useState('');
  /* -------------------------------------------------------------------------- */

  // The GetToken API endpoint should be secured behind some form of authentication (for example, OAuth) to prevent unauthorized users from obtaining tokens to use against your Immersive Reader service and billing; that work is beyond the scope of this sample.
  const _getCredentials = async () => {

    try {

      const response = await fetch(`http://localhost:3001/GetTokenAndSubdomain`, {
        method: 'GET',
      });
      const json = await response.json();
      const { token, subdomain } = json;
      setToken(token)
      setSubdomain(subdomain)

    }
    catch (err) {
      console.log({ err })
      alert('There was a problem fetching your credentials, please check the console and make sure your environment variables are correct');
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

    try {
      await launchAsync(token, subdomain, data, options)
        .catch(error => handleError(error, 'launch'));
    }
    catch (error) {
      console.log(error);
      alert("Error in launching the Immersive Reader. Check the console.");
    }
  }


  // We use a react hook to fetch when the component is rendered (similar to componentDidMount)
  useEffect(() => {
    _getCredentials()
      .catch(error => handleError(error, 'token'));
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
