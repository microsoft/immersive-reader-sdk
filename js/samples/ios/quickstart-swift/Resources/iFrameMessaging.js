// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

window.addEventListener("message", function(message) {
    if (message.data == "ImmersiveReader-ReadyForContent") {
        window.webkit.messageHandlers.readyForContent.postMessage(null);
    }
    if (message.data == "ImmersiveReader-LaunchSuccessful") {
        window.webkit.messageHandlers.launchSuccessful.postMessage(null);
    }
    if (message.data == "ImmersiveReader-TokenExpired") {
        window.webkit.messageHandlers.tokenExpired.postMessage(null);
    }
    if (message.data == "ImmersiveReader-Throttled") {
        window.webkit.messageHandlers.throttled.postMessage(null);
    }
});

// IMPORTANT: When posting a message to an iframe, replace the below target with your localhost and port.
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
function sendContentToReader(message) {
    document.getElementById('immersiveReaderIframe').contentWindow.postMessage(JSON.stringify({messageType:'Content', messageValue: message}), 'http://127.0.0.1:8080');
}
