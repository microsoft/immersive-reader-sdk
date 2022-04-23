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

    @action
    async launchReader() {
        await this.getTokenAndSubdomainAsync();
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

        try {
            await launchAsync(this.token, this.subdomain, data, options)
        }
        catch (error) {
            console.log(error);
            alert("Error in launching the Immersive Reader. Check the console.");
        }
    }

    @action
    async handleLaunchImmersiveReader(sampleId) {
        await this.getTokenAndSubdomainAsync();
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

        try{
            await launchAsync(this.token, this.subdomain, data, options);
        }
        catch (error) {
            console.log(error);
            alert("Error in launching the Immersive Reader. Check the console.");
        }
    }
}