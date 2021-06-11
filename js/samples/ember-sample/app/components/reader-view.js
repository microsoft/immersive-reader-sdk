import Component from '@ember/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch'
import { launchAsync, initialize } from "@microsoft/immersive-reader-sdk"

export default class ReaderViewComponent extends Component {

    @tracked token = null;
    @tracked subdomain = null;

    didInsertElement() {
        initialize();
    }

    @action
    async getCredentials() {
        try {
            const response = await fetch(`http://localhost:3001/GetTokenAndSubdomain`, {
                method: 'GET',
            });
            const json = await response.json();
            const { token, subdomain } = json;
            this.token = token;
            this.subdomain = subdomain;
            alert('Credentials successfully retrieved!')
        }
        catch (err) {
            alert('There was a problem fetching your credentials, please check the console and make sure your environment variables are set');
            console.log({ err })
        }
    }

    exitCallback() {
        alert("This is the callback function. It is executed when the Immersive Reader closes.");
    }

    @action
    async launchReader() {

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

        if (this.token === null) {
            alert('Error please first retrieve your token!')
        } else {
            try {
                await launchAsync(this.token, this.subdomain, data, options)
            }
            catch (error) {
                alert("Error in launching the Immersive Reader. Check the console.");
                console.log(error);
            }
        }
    }
}