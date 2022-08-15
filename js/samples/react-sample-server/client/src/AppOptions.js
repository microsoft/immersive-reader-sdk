import React, { useEffect, useState } from "react";
import { launchAsync } from "@microsoft/immersive-reader-sdk"

function AppOptions() {

  const [token, setToken] = useState('');
  const [subdomain, setSubdomain] = useState('');  
  const [parent, setParent] = useState(false);
  const [language, setLanguage] = useState('en');

  const styles = {
    parent_frame: {
        height: 400
    },
    section: {
        border: "1px solid #cccccc",
        borderRadius: "4px",
        boxSizing: "border-box",
        display: "block",
        marginBottom: "20px",
        padding: "20px 20px 10px 20px",
        position: "relative",
        width: "100%"
    },
    immersive_reader_button: {
        backgroundColor: "white",
        marginTop: "5px",
        border: "1px solid black",
        float: "right"
    }
  };

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

  const handleLaunchImmersiveReader = async (sampleId) => {

    var langElement = document.getElementById('lang_' + sampleId);
    var lang = sampleId === 'DisableLanguageDetection' ? langElement.value : 'en';

    const data = {
        title: document.getElementById('title' + sampleId).innerText,
        chunks: [{
            content: document.getElementById('text' + sampleId).innerHTML,
            lang: lang
        }]
    };

    // Learn more about options https://docs.microsoft.com/azure/cognitive-services/immersive-reader/reference#options
    let options = {};

    options.disableLanguageDetection = sampleId === 'DisableLanguageDetection';
    options.disableGrammar = sampleId === 'DisableGrammar';
    options.disableTranslation = sampleId === 'DisableTranslation';
    options.parent = sampleId === 'Parent' && document.getElementById("checkboxParent").checked ? document.getElementById('parentDiv') : null;

    try {
      await launchAsync(token, subdomain, data, options)
    }
    catch (error) {
      console.log(error);
      alert("Error in launching the Immersive Reader. Check the console.");
    }
  }

  const handleLanguage = (e) => setLanguage(e.target.value);

  // We use a react hook to fetch when the component is rendered (similar to componentDidMount)
  useEffect(() => {
    _getCredentials();
  }, [])

  return (
    <div>
        <div className="container">
            <h1>You can disable Immersive Reader features as desired!</h1>
            <p>These are some of the features you can disable:</p>
            <p><code>disableGrammar</code> Grammar features such as Syllables, Parts of speech, and Picture Dictionary will be disabled.</p>
            <p><code>disableLanguageDetection</code> The Language Detection feature will be disabled. This will prevent Immersive Reader from automatically detecting the language of the supplied content.</p>
            <p><code>disableTranslation</code> The Translation features will be disabled.</p>
            <p><code>parent</code> Immersive reader iframe is placed the specified element, otherwise it will be placed in the main document body.</p>
            <h3>Examples:</h3><br />
            <section style={styles.section} id='sampleDisableLanguageDetection'>
                <div className="immersive-reader-button" onClick={ () => handleLaunchImmersiveReader('DisableLanguageDetection')} style={styles.immersive_reader_button}></div>
                Specify the content language: <input id='lang_DisableLanguageDetection' value={language} onChange={handleLanguage} /> (i.e 'fr', 'es', 'de', 'zh')
                <h3 id='titleDisableLanguageDetection'>Geography (Speech, Syllables, Parts of Speech and Picture Dictionary are all affected by the language.)</h3>
                <p id='textDisableLanguageDetection'>The study of Earth's landforms is called physical geography. Landforms can be mountains and valleys. They can also be glaciers, lakes or rivers. Landforms are sometimes called physical features. It is important for students to know about the physical geography of Earth. The seasons, the atmosphere and all the natural processes of Earth affect where people are able to live. Geography is one of a combination of factors that people use to decide where they want to live.</p>
            </section>
            <div style={styles.Cols}>
                <section style={styles.section} id='sampleDisableGrammar'>
                    <div className="immersive-reader-button" onClick={ () => handleLaunchImmersiveReader('DisableGrammar')} style={styles.immersive_reader_button}></div>
                    <h3 id='titleDisableGrammar'>Water (Parts of Speech, Syllables and Picture Dictionary are disabled)</h3>
                    <p id='textDisableGrammar'>Fresh water sources also influence where people settle. People need water to drink. They also need it for washing. Throughout history, people have settled near fresh water. Living near a water source helps ensure that people have the water they need.</p>
                </section>
                <section style={styles.section} id='sampleDisableTranslation'>
                    <div className="immersive-reader-button" onClick={ () => handleLaunchImmersiveReader('DisableTranslation')} style={styles.immersive_reader_button}></div>
                    <h3 id='titleDisableTranslation'>Mountain Ranges (Translation disabled)</h3>
                    <p id='textDisableTranslation'>The physical features of a region are often rich in resources. Within a nation, mountain ranges become natural borders for settlement areas. In the U.S., major mountain ranges are the Sierra Nevada, the Rocky Mountains, and the Appalachians.</p>
                </section>
            </div>
            <section style={styles.section} id='sampleParent'>
                <div className="immersive-reader-button" onClick={ () => handleLaunchImmersiveReader('Parent')} style={styles.immersive_reader_button}></div>
                <input type="checkbox" id="checkboxParent" checked={parent} onChange={()=> setParent(!parent)}/>
                <label htmlFor="checkboxParent"> Launch in Parent </label>
                <h3 id='titleParent'>Kaiju (Displaying in parent)</h3>
                <p id='textParent'>Kaiju is a Japanese genre of films and television featuring giant monsters. The term kaiju can also refer to the giant monsters themselves, which are usually depicted attacking major cities and battling either with the military or other monsters. The kaiju genre is a subgenre of tokusatsu (special filming) entertainment.</p>
                <div id="parentDiv" style={styles.parent_frame}></div>
            </section>
        </div>
    </div>
  );
}

export default AppOptions;
