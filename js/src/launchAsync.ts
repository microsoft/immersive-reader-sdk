// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Content } from './content';
import { CookiePolicy, DisplayOptions, Options, ReadAloudOptions, TranslationOptions } from './options';
import { Error, ErrorCode } from './error';
import { LaunchResponse } from './launchResponse';
declare const VERSION: string;

type Message = {
    launchToPostMessageSentDurationInMs: number;
    request?: Content;
    apiResponse?: ApiResponseSuccessMessage;
    cogSvcsAccessToken?: string;
    cogSvcsSubdomain?: string;
    disableFirstRun?: boolean;
    readAloudOptions?: ReadAloudOptions;
    translationOptions?: TranslationOptions;
    displayOptions?: DisplayOptions;
    sendPreferences?: boolean;
    preferences?: string;
};

type LaunchResponseMessage = {
    success: boolean;
    sessionId: string;
    errorCode?: ErrorCode;
    meteredContentSize?: number;
};

type ApiResponseSuccessMessage = {
    data: any;
    meta: any;
    status: number;
};

type LaunchWithoutContentResponse = {
    provideApiResponse: (apiResponse: ApiResponseSuccessMessage) => Promise<LaunchResponse>;
    cancelAndCloseReader: () => void;
};

type LaunchWithoutContentResolve = (value: LaunchWithoutContentResponse) => void;
type LaunchResponseResolve = (value: LaunchResponse) => void;
type LaunchReject = (reason: Error) => void;

const sdkPlatform = 'js';
const sdkVersion = VERSION;

const PostMessagePreferences = 'ImmersiveReader-Preferences:';
const PostMessageLaunchResponse = 'ImmersiveReader-LaunchResponse:';

const errorMessageMap: { [errorCode: string]: string } = {};
errorMessageMap[ErrorCode.TokenExpired] = 'The access token supplied is expired.';
errorMessageMap[ErrorCode.Throttled] = 'You have exceeded your quota.';
errorMessageMap[ErrorCode.ServerError] = 'An error occurred when calling the server to process the text.';
errorMessageMap[ErrorCode.InvalidSubdomain] = 'The subdomain supplied is invalid.';

let isLoading: boolean = false;
let readyForContent: boolean = false;
let apiResponseMessage: ApiResponseSuccessMessage;

let launchResponseResolve: LaunchResponseResolve;
let launchResponseReject: LaunchReject;
let launchResponseError: Error;

/**
 * Launch the Immersive Reader within an iframe.
 * @param options Options for configuring the look and feel of the Immersive Reader.
 * @return A promise that resolves with a LaunchWithoutContentResponse to provide the S2S response
 */
export function launchWithoutContentAsync(options?: Options): Promise<LaunchWithoutContentResponse> {
    if (isLoading) {
        return Promise.reject('Immersive Reader is already launching');
    }

    isLoading = true;
    const startTime = Date.now();

    options = {
        uiZIndex: 1000,
        timeout: 15000,  // Default to 15 seconds
        useWebview: false,
        allowFullscreen: true,
        hideExitButton: false,
        cookiePolicy: CookiePolicy.Disable,
        ...options
    };

    // Ensure that we were given a number for the UI z-index
    if (!options.uiZIndex || typeof options.uiZIndex !== 'number') {
        options.uiZIndex = 1000;
    }

    let timeoutId: number | null = null;
    const iframeContainer: HTMLDivElement = document.createElement('div');
    const iframe: HTMLIFrameElement = options.useWebview ? <HTMLIFrameElement>document.createElement('webview') : document.createElement('iframe');
    iframe.allow = 'autoplay';
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
            try {
                options.onExit();
            } catch { }
        }
    };

    const sendContentIfReady = (): void => {
        if (readyForContent && apiResponseMessage) {
            const message: Message = {
                apiResponse: apiResponseMessage,
                launchToPostMessageSentDurationInMs: Date.now() - startTime,
                disableFirstRun: options.disableFirstRun,
                readAloudOptions: options.readAloudOptions,
                translationOptions: options.translationOptions,
                displayOptions: options.displayOptions,
                sendPreferences: !!options.onPreferencesChanged,
                preferences: options.preferences
            };

            iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'ContentModelWithOptions', messageValue: message }), '*');
        }
    };

    const messageHandler = (e: any): void => {
        // Don't process the message if the data is not a string
        if (!e || !e.data || typeof e.data !== 'string') { return; }

        if (e.data === 'ImmersiveReader-ReadyForContent') {
            resetTimeout(); // Reset the timeout once the reader page loads successfully. The Reader page will report further errors through PostMessage if there is an issue obtaining the ContentModel from the server
            readyForContent = true;
            sendContentIfReady();
        } else if (e.data === 'ImmersiveReader-Exit') {
            exit();
        } else if (e.data.startsWith(PostMessageLaunchResponse)) {
            let launchResponse: LaunchResponse = null;
            let error: Error = null;

            let response: LaunchResponseMessage = null;
            try {
                response = JSON.parse(e.data.substring(PostMessageLaunchResponse.length));
            } catch {
                // No-op
            }

            if (response && response.success) {
                launchResponse = {
                    container: iframeContainer,
                    sessionId: response.sessionId,
                    charactersProcessed: response.meteredContentSize
                };
            } else if (response && !response.success) {
                error = {
                    code: response.errorCode,
                    message: errorMessageMap[response.errorCode],
                    sessionId: response.sessionId
                };
            } else {
                error = {
                    code: ErrorCode.ServerError,
                    message: errorMessageMap[ErrorCode.ServerError]
                };
            }

            isLoading = false;
            if (launchResponse) {
                resetTimeout();
                if (launchResponseResolve) {
                    launchResponseResolve(launchResponse);
                }
            } else if (error) {
                exit();
                if (launchResponseReject) {
                    launchResponseReject(error);
                }
            }
        } else if (e.data.startsWith(PostMessagePreferences)) {
            if (options.onPreferencesChanged && typeof options.onPreferencesChanged === 'function') {
                try {
                    options.onPreferencesChanged(e.data.substring(PostMessagePreferences.length));
                } catch { }
            }
        }
    };

    // Reset variables
    reset();

    window.addEventListener('message', messageHandler);

    // Reject the promise if the Immersive Reader page fails to load.
    timeoutId = window.setTimeout((): void => {
        reset();
        isLoading = false;

        const error: Error = { code: ErrorCode.Timeout, message: `Page failed to load after timeout (${options.timeout} ms)` };

        if (launchResponseReject) {
            launchResponseReject(error);
        } else {
            // Can't reject yet, will reject at earliest possible moment
            launchResponseError = error;
        }
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

    let src = 'https://learningtools.onenote.com/learningtoolsapp/cognitive/reader?exitCallback=ImmersiveReader-Exit&skipearlygcm=true&sdkPlatform=' + sdkPlatform + '&sdkVersion=' + sdkVersion;
    src += '&cookiePolicy=' + ((options.cookiePolicy === CookiePolicy.Enable) ? 'enable' : 'disable');

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

    const launchWithoutContentResponse: LaunchWithoutContentResponse = {
        cancelAndCloseReader: exit,
        provideApiResponse: (apiResponse: ApiResponseSuccessMessage): Promise<LaunchResponse> => {
            if (!apiResponse) {
                return Promise.reject({ code: ErrorCode.BadArgument, message: 'No Api Response' });
            }

            if (apiResponse.status !== 200) {
                return Promise.reject({ code: ErrorCode.BadArgument, message: 'Unsuccessful Api Response' });
            }

            if (!apiResponse.data) {
                return Promise.reject({ code: ErrorCode.BadArgument, message: 'No data in Api Response' });
            }

            if (!apiResponse.meta) {
                return Promise.reject({ code: ErrorCode.BadArgument, message: 'No meta in Api Response' });
            }

            apiResponseMessage = apiResponse;
            sendContentIfReady();

            return new Promise((resolve: LaunchResponseResolve, reject: LaunchReject) => {
                launchResponseResolve = resolve;
                launchResponseReject = reject;

                // Errored before host provided an api response
                if (launchResponseError) {
                    reject(launchResponseError);

                    // Make sure we only reject once
                    launchResponseError = null;
                }
            });
        }
    };

    const launchWithoutContentPromise: Promise<LaunchWithoutContentResponse> = new Promise((resolve: LaunchWithoutContentResolve, _reject: LaunchReject) => {
        resolve(launchWithoutContentResponse);
    });

    return launchWithoutContentPromise;
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

export function resetLoadingForTest(): void {
    isLoading = false;
}