// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Content } from './content';
import { Options } from './options';
import { Error, ErrorCode } from './error';
declare const VERSION: string;

type Message = {
    cogSvcsAccessToken: string;
    cogSvcsSubdomain: string;
    request: Content;
    launchToPostMessageSentDurationInMs: number;
};

const sdkPlatform = 'js';
const sdkVersion = VERSION;

/**
 * Launch the Immersive Reader within an iframe.
 * @param token The authentication token.
 * @param subdomain The Immersive Reader Cognitive Service subdomain. This is a required parameter for Azure AD authentication in this and future versions of this SDK. Use of the Cognitive Services issueToken endpoint-based authentication tokens is deprecated and no longer supported.
 * @param content The content that should be shown in the Immersive Reader.
 * @param options Options for configuring the look and feel of the Immersive Reader.
 * @return A promise that resolves when the Immersive Reader is launched. The promise resolves with the div that contains an iframe which contains the Immersive Reader.
 */
export function launchAsync(token: string, subdomain: string, content: Content, options?: Options): Promise<HTMLDivElement> {
    return new Promise((resolve, reject: (reason: Error) => void): void => {
        if (!token) {
            reject({ code: ErrorCode.BadArgument, message: 'Token must not be null' });
            return;
        }

        if (!content) {
            reject({ code: ErrorCode.BadArgument, message: 'Content must not be null' });
            return;
        }

        if (!content.chunks) {
            reject({ code: ErrorCode.BadArgument, message: 'Chunks must not be null' });
            return;
        }

        if (!content.chunks.length) {
            reject({ code: ErrorCode.BadArgument, message: 'Chunks must not be empty' });
            return;
        }

        if (!isValidSubdomain(subdomain) && (!options || !options.customDomain)) {
            reject({ code: ErrorCode.BadArgument, message: 'The subdomain supplied is invalid.' });
            return;
        }

        const startTime = Date.now();
        options = {
            uiZIndex: 1000,
            timeout: 15000,  // Default to 15 seconds
            useWebview: false,
            allowFullscreen: true,
            hideExitButton: false,
            enableCookies: false,
            ...options
        };

        // Ensure that we were given a number for the UI z-index
        if (!options.uiZIndex || typeof options.uiZIndex !== 'number') {
            options.uiZIndex = 1000;
        }

        let timeoutId: number | null = null;
        const iframeContainer: HTMLDivElement = document.createElement('div');
        const iframe: HTMLIFrameElement = options.useWebview ? <HTMLIFrameElement>document.createElement('webview') : document.createElement('iframe');
        const noscroll: HTMLStyleElement = document.createElement('style');
        noscroll.innerHTML = 'body{height:100%;overflow:hidden;}';

        const resetTimeout = (): void => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        const reset = (): void => {
            // Remove container along with the iframe inside of it
            if (document.body.contains(iframeContainer)) {
                document.body.removeChild(iframeContainer);
            }

            window.removeEventListener('message', messageHandler);

            // Clear the timeout timer
            resetTimeout();

            // Re-enable scrolling
            if (noscroll.parentNode) {
                noscroll.parentNode.removeChild(noscroll);
            }
        };

        const exit = (): void => {
            reset();

            // Execute exit callback if we have one
            if (options.onExit) {
                options.onExit();
            }
        }

        // Reset variables
        reset();

        const messageHandler = (e: any): void => {
            if (!e || !e.data) { return; }

            if (e.data === 'ImmersiveReader-ReadyForContent') {
                resetTimeout(); // Reset the timeout once the reader page loads successfully. The Reader page will report further errors through PostMessage if there is an issue obtaining the ContentModel from the server
                const message: Message = {
                    cogSvcsAccessToken: token,
                    cogSvcsSubdomain: subdomain,
                    request: content,
                    launchToPostMessageSentDurationInMs: Date.now() - startTime
                };
                iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'Content', messageValue: message }), '*');
            } else if (e.data === 'ImmersiveReader-LaunchSuccessful') {
                resetTimeout();
                resolve(iframeContainer);
            } else if (e.data === 'ImmersiveReader-TokenExpired') {
                exit();
                reject({ code: ErrorCode.TokenExpired, message: 'The access token supplied is expired.' });
            } else if (e.data === 'ImmersiveReader-Throttled') {
                exit();
                reject({ code: ErrorCode.Throttled, message: 'You have exceeded your quota.' });
            } else if (e.data === 'ImmersiveReader-InvalidCognitiveServicesSubdomain') {
                exit();
                reject({ code: ErrorCode.BadArgument, message: 'The subdomain supplied is invalid.' });
            } else if (e.data === 'ImmersiveReader-ServerError') {
                exit();
                reject({ code: ErrorCode.ServerError, message: 'An error occurred when calling the server to process the text.' });
            }  else if (e.data === 'ImmersiveReader-Exit') {
                exit();
            }
        };
        window.addEventListener('message', messageHandler);

        // Reject the promise if the Immersive Reader page fails to load.
        timeoutId = window.setTimeout((): void => {
            reset();
            reject({ code: ErrorCode.Timeout, message: `Page failed to load after timeout (${options.timeout} ms)` });
        }, options.timeout);

        // Create and style iframe
        if (options.allowFullscreen) {
            iframe.setAttribute('allowfullscreen', '');
        }
        iframe.style.cssText = 'position: static; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0';

        // Send an initial message to the webview so it has a reference to this parent window
        if (options.useWebview) {
            iframe.addEventListener('loadstop', () => {
                iframe.contentWindow.postMessage(JSON.stringify({ messageType: 'WebviewHost' }), '*');
            });
        }

        const domain = options.customDomain ? options.customDomain : `https://${subdomain}.cognitiveservices.azure.com/immersivereader/webapp/v1.0/`;
        let src = domain + 'reader?exitCallback=ImmersiveReader-Exit&sdkPlatform=' + sdkPlatform + '&sdkVersion=' + sdkVersion;

        src += '&useCookies=' + (options.enableCookies ? 'true' : 'false');

        if (options.hideExitButton) {
            src += '&hideExitButton=true';
        }

        if (options.uiLang) {
            src += '&omkt=' + options.uiLang;
        }

        iframe.src = src;

        iframeContainer.style.cssText = `position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0; -webkit-perspective: 1px; z-index: ${options.uiZIndex}; background: white; overflow: hidden`;

        iframeContainer.appendChild(iframe);
        document.body.appendChild(iframeContainer);

        // Disable body scrolling
        document.head.appendChild(noscroll);
    });
}

export function close(): void {
    window.postMessage('ImmersiveReader-Exit', '*');
}

// The subdomain must be alphanumeric, and may contain '-',
// as long as the '-' does not start or end the subdomain.
export function isValidSubdomain(subdomain: string): boolean {
    if (!subdomain) {
        return false;
    }

    const validRegex = '^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])$';
    const regExp = new RegExp(validRegex);

    return regExp.test(subdomain);
}