import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch'
import { launchAsync } from "@microsoft/immersive-reader-sdk"

export default class ReaderViewComponent extends Component {

    @tracked token = null;
    @tracked subdomain = null;

    async getTokenAndSubdomainAsync() {
        try {
            const response = await fetch(`http://localhost:3001/GetTokenAndSubdomain`, {
                method: 'GET',
            });
            const json = await response.json();
            const { token, subdomain } = json;
            this.token = token;
            this.subdomain = subdomain;
        }
        catch (err) {
            console.log({ err })
            alert('There was a problem fetching your credentials, please check the console and make sure your environment variables are set');
        }
    }

    exitCallback() {
        alert("This is the callback function. It is executed when the Immersive Reader closes.");
    }

    handleError = (error, caller) => {

        let alertMessage = `Error in ${caller === 'token' ? 'getting the Immersive Reader token' : 'launching the Immersive Reader'}. Check the console.`
        let errorStatus = error.status ?? 'unknown';
        let errorStatusText = error.statusText ?? 'unknown';
        let errorMessage = error.message ?? 'unknown';
        let errorSessionId = error.sessionId ?? 'unknown'; // Customers can report this sessionId to Immersive Reader team for further debugging.
        let errorMessageToLog = `Error - Status: ${errorStatus}, StatusText: ${errorStatusText}, Message: ${errorMessage}, SessionId: ${errorSessionId}`;
    
        console.log(errorMessageToLog);
    
        alert(alertMessage);
    }

    // The GetToken API endpoint should be secured behind some form of authentication (for example, OAuth) to prevent unauthorized users from obtaining tokens to use against your Immersive Reader service and billing; that work is beyond the scope of this sample.
    @action
    async launchReader() {
        await this.getTokenAndSubdomainAsync()
            .catch(error => handleError(error, 'token'));
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
            "cookiePolicy": 1,
            "onExit": this.exitCallback
        };

        await launchAsync(this.token, this.subdomain, data, options)
            .catch(error => handleError(error, 'launch'));
    }

    @action
    async handleLaunchImmersiveReader(sampleId) {
        await this.getTokenAndSubdomainAsync()
            .catch(error => handleError(error, 'token'));
        var langElement = $('#lang_' + sampleId);
        var lang = sampleId == 'DisableLanguageDetection' ? langElement.val() : 'en';

        const data = {
            title: $('#title' + sampleId).text().trim(),
            chunks: [{
                content: $('#text' + sampleId).text().trim(),
                lang: lang
            }]
        };

        let options = {};

        options.disableLanguageDetection = sampleId === 'DisableLanguageDetection';
        options.disableGrammar = sampleId === 'DisableGrammar';
        options.disableTranslation = sampleId === 'DisableTranslation';
        options.parent = sampleId === 'Parent' && document.getElementById("checkboxParent").checked ? document.getElementById('parentDiv') : null;

        await launchAsync(this.token, this.subdomain, data, options)
            .catch(error => handleError(error, 'launch'));
    }
}