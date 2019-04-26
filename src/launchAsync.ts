// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Content } from './content';
import { Options } from './options';
import { Error } from './error';

type Message = {
    cogSvcsAccessToken: string;
    request: Content;
    launchToPostMessageSentDurationInMs: number;
};

/**
 * Launch the Immersive Reader within an iframe.
 * @param token The authentication token returned from the Cognitive Services issueToken API.
 * @param content The content that should be shown in the Immersive Reader.
 * @param options Options for configuring the look and feel of the Immersive Reader.
 * @return A promise that resolves when the Immersive Reader is launched. The promise resolves with the div that contains an iframe which contains the Immersive Reader.
 */
export function launchAsync(token: string, content: Content, options?: Options): Promise<HTMLDivElement> {
    return new Promise((resolve, reject: (reason: Error) => void): void => {
        if (!token) {
            reject({ code: 'BadArgument', message: 'Token must not be null' });
            return;
        }

        if (!content) {
            reject({ code: 'BadArgument', message: 'Content must not be null' });
            return;
        }

        if (!content.chunks) {
            reject({ code: 'BadArgument', message: 'Chunks must not be null' });
            return;
        }

        if (!content.chunks.length) {
            reject({ code: 'BadArgument', message: 'Chunks must not be empty' });
            return;
        }

        const startTime = Date.now();
        options = {
            uiZIndex: 1000,
            timeout: 15000,  // Default to 15 seconds
            useWebview: false,
            ...options
        };

        // Ensure that we were given a number for the UI z-index
        if (!options.uiZIndex || typeof options.uiZIndex !== 'number') {
            options.uiZIndex = 1000;
        }

        let timeoutId: number | null = null;
        const iframeContainer: HTMLDivElement = document.createElement('div');
        const iframe: HTMLIFrameElement = options.useWebview ? <HTMLIFrameElement>document.createElement('webview') : document.createElement('iframe');
        const bodyOverflow: string | null = document.body.style.overflow;
        const htmlOverflow: string | null = document.documentElement.style.overflow;

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

            // Clear the timeout timer
            resetTimeout();

            // Re-enable scrolling
            document.body.style.overflow = bodyOverflow;
            document.documentElement.style.overflow = htmlOverflow;
        };

        // Reset variables
        reset();

        const messageHandler = (e: any): void => {
            if (!e || !e.data) { return; }

            if (e.data === 'ImmersiveReader-Exit') {
                reset();
                window.removeEventListener('message', messageHandler);
            } else if (e.data === 'ImmersiveReader-ReadyForContent') {
                resetTimeout();
                const message: Message = {
                    cogSvcsAccessToken: token,
                    request: content,
                    launchToPostMessageSentDurationInMs: Date.now() - startTime
                };
                iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'Content', messageValue: message }), '*');
                resolve(iframeContainer);
            }
        };
        window.addEventListener('message', messageHandler);

        // Reject the promise if the Immersive Reader page fails to load.
        timeoutId = window.setTimeout((): void => {
            reject({ code: 'Timeout', message: `Page failed to load after timeout (${options.timeout} ms)` });
        }, options.timeout);

        // Create and style iframe
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position: static; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0';

        // Send an initial message to the webview so it has a reference to this parent window
        if (options.useWebview) {
            iframe.addEventListener('loadstop', () => {
                iframe.contentWindow.postMessage(JSON.stringify({ messageType: 'WebviewHost' }), '*');
            });
        }

        let src = 'https://learningtools.onenote.com/learningtoolsapp/cognitive/reader?exitCallback=ImmersiveReader-Exit';
        if (options.uiLang) {
            src += '&omkt=' + options.uiLang;
        }
        iframe.src = src;

        iframeContainer.style.cssText = `position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0; -webkit-perspective: 1px; z-index: ${options.uiZIndex}; background: white; overflow: hidden`;

        iframeContainer.appendChild(iframe);
        document.body.append(iframeContainer);

        // Disable body scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    });
}

/**
 * Append an <img/> of assets/icon.svg to every element with the specified className. Intended to be used with divs to avoid default styles
 */
export function styleLaunchDivs(className: string): void {
    const launchDivs: HTMLCollectionOf<Element> = document.getElementsByClassName(className);
    const iconImagePath = '../../assets/icon.svg';

    for (const launchDiv of launchDivs) {
        const castedLaunchDiv = launchDiv as HTMLDivElement;
        const iconImage: HTMLImageElement = document.createElement('img');
        iconImage.src = iconImagePath;
        iconImage.alt = 'Immersive Reader';

        castedLaunchDiv.style.height = castedLaunchDiv.style.width = '20px';
        castedLaunchDiv.appendChild(iconImage);
    }
}
