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
            ...options
        };

        // Ensure that we were given a number for the UI z-index
        if (!options.uiZIndex || typeof options.uiZIndex !== 'number') {
            options.uiZIndex = 1000;
        }

        let timeoutId: number | null = null;
        const iframeContainer: HTMLDivElement = document.createElement('div');
        const iframe: HTMLIFrameElement = document.createElement('iframe');
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
 * Style the launch buttons with an encoded SVG of the assets\icon.svg
 */
export function styleLaunchButtons(): void {
    const buttons: HTMLCollectionOf<Element> = document.getElementsByClassName('IRLaunchButton');
    const encodedSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 40 37' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg fill-rule='nonzero'%3E%3Cpath d='M37.4,0.9 L37.4,9.6 L35.4,9.6 L35.4,2.9 L24.4,2.9 C22.9,3.3 20,4.5 20,6 L20,17.2 L18,17.2 L18,6 C18,5 15.6,3.6 13.8,2.9 L2,2.9 L2,29 L12.4,29 L12.4,31 L0,31 L0,0.9 L14.1,0.9 L14.3,1 C15,1.2 17.5,2.2 18.9,3.7 C20.5,1.9 23.5,1.1 23.9,1 L24.1,1 L37.4,1 L37.4,0.9 Z' fill='%23000000'%3E%3C/path%3E%3Cpath d='M27.4,37 L25.8,37 L18.4,29.4 L14,29.4 L14,21 L18.4,20.9 L26.1,13 L27.4,13 L27.4,37 Z M16,27.4 L19.2,27.4 L25.3,33.7 L25.3,16.6 L19.2,22.9 L15.9,22.9 L15.9,27.4 L16,27.4 Z' fill='%230197F2'%3E%3C/path%3E%3Cpath d='M31.3,32.7 L29.6,31.7 C29.6,31.7 31.7,28.3 31.7,25.2 C31.7,21.9 29.6,18.5 29.6,18.4 L31.3,17.4 C31.4,17.6 33.7,21.3 33.7,25.2 C33.7,28.8 31.4,32.6 31.3,32.7 Z' fill='%230197F2'%3E%3C/path%3E%3Cpath d='M36.4,36.2 L34.8,35 C34.8,35 38,30.8 38,25.2 C38,19.6 34.8,15.4 34.8,15.4 L36.4,14.2 C36.5,14.4 40,19 40,25.3 C40,31.5 36.5,36 36.4,36.2 Z' fill='%230197F2'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

    for (const button of buttons) {
        const castedButton = button as HTMLButtonElement;

        castedButton.style.backgroundImage = encodedSvg;
        castedButton.style.height = castedButton.style.width = '40px';
    }
}
