// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

window.addEventListener("message",
                        function(message) {
                       
                        if(message.data == "ImmersiveReader-ReadyForContent") {
                            window.webkit.messageHandlers.readyForContent.postMessage(null);
                        }
                        
                        if(message.data == "ImmersiveReader-LaunchSuccessful") {
                            window.webkit.messageHandlers.launchSuccessful.postMessage(null);
                        }
                        
                        if(message.data == "ImmersiveReader-TokenExpired") {
                            window.webkit.messageHandlers.tokenExpired.postMessage(null);
                        }
                        
                        if(message.data == "ImmersiveReader-Throttled") {
                            window.webkit.messageHandlers.throttled.postMessage(null);
                        }
                        });

function sendContentToReader(message) {
    // Send a post message to the iframe.
    document.getElementById('immersiveReaderIframe').contentWindow.postMessage(JSON.stringify({'messageType':'Content', 'messageValue': message}), '*');
}
