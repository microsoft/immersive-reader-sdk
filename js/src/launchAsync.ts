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
    cogSvcsSubdomain?: string | null;
    disableFirstRun?: boolean;
    readAloudOptions?: ReadAloudOptions;
    translationOptions?: TranslationOptions;
    displayOptions?: DisplayOptions;
    sendPreferences?: boolean;
    preferences?: string;
};

type LaunchResponseMessage = {
    success: boolean;
    errorCode?: ErrorCode;
    sessionId: string;
    meteredContentSize?: number;
};

type ApiResponseSuccessMessage = {
    data: any;
    meta: any;
    status: number;
};

// TODO: This can be split between the 2 functions since theres no overlap at the moment
type Extras = {
    content?: Content;
    subdomain?: string;
    reject?: (reason: Error) => void;
    resolve?: (value: LaunchResponse | PromiseLike<LaunchResponse>) => void;
    sendContentIfReady?: () => void;
    startTime?: number;
    token?: string;
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

// function _checkIfLoading(): Promise<LaunchResponse> | null {
//     if (isLoading) {
//         return Promise.reject('Immersive Reader is already launching');
//     }
//     return null;
// }

// Added globals to persist between functions
let timeoutId: number | null = null;
let parent: Node = null;
let iframeContainer: HTMLDivElement = null;
let iframe: HTMLIFrameElement = null;
let noscroll: HTMLStyleElement = null;
let messageHandler: (e: any) => void = null;

enum FuncType { launchAsync, launchWithoutContentAsync }

function _initializeOptions(options?: Options): Options {

    const { allowFullscreen, cookiePolicy, hideExitButton, onExit, parent, timeout, uiZIndex, useWebview } = options || {};

    // FIXME: will this options set work?
    const _options = {
        ...options,
        uiZIndex: (!uiZIndex || typeof options.uiZIndex !== 'number') ? 1000 : uiZIndex,
        timeout: timeout || 15000,  // Default to 15 seconds
        useWebview: useWebview || false,
        allowFullscreen: allowFullscreen || true,
        hideExitButton: hideExitButton || false,
        cookiePolicy: cookiePolicy || CookiePolicy.Disable,
        onExit
    };

    _generateIframeVariables(parent, useWebview, allowFullscreen);

    return _options;
}

function _createMessageHandler(options: Options, funcType: FuncType, extras: Extras) {
    return (e: any) => {
        // Don't process the message if the data is not a string
        if (!e || !e.data || typeof e.data !== 'string') { return; }

        if (e.data === 'ImmersiveReader-ReadyForContent') {
            switch (funcType) {
                case FuncType.launchAsync: {
                    resetTimeout(); // Reset the timeout once the reader page loads successfully. The Reader page will report further errors through PostMessage if there is an issue obtaining the ContentModel from the server
                    const {
                        content,
                        subdomain,
                        startTime,
                        token
                    } = extras;
                    const message: Message = {
                        cogSvcsAccessToken: token,
                        cogSvcsSubdomain: subdomain,
                        request: content,
                        launchToPostMessageSentDurationInMs: Date.now() - startTime,
                        disableFirstRun: options.disableFirstRun,
                        readAloudOptions: options.readAloudOptions,
                        translationOptions: options.translationOptions,
                        displayOptions: options.displayOptions,
                        sendPreferences: !!options.onPreferencesChanged,
                        preferences: options.preferences
                    };
                    iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'Content', messageValue: message }), '*');
                    break;
                }
                case FuncType.launchWithoutContentAsync: {
                    resetTimeout(); // Reset the timeout once the reader page loads successfully. The Reader page will report further errors through PostMessage if there is an issue obtaining the ContentModel from the server
                    readyForContent = true;
                    const { sendContentIfReady } = extras;
                    sendContentIfReady();
                    break;
                }
                default:
                    return;
            }
        } else if (e.data === 'ImmersiveReader-Exit') {
            exit(options.onExit);
            return;
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
                const playMessageValue: any = {
                    command: 'PlayState',
                    parameters: 'Play'
                };

                const pauseMessageValue: any = {
                    command: 'PlayState',
                    parameters: 'Pause'
                };

                launchResponse = {
                    container: iframeContainer,
                    sessionId: response.sessionId,
                    charactersProcessed: response.meteredContentSize,
                    postLaunchOperations: {
                        pause: () => {
                            iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'InstrumentationCommand', messageValue: pauseMessageValue }), '*');
                        },
                        play: () => {
                            iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'InstrumentationCommand', messageValue: playMessageValue }), '*');
                        }
                    }
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

            if (funcType === FuncType.launchAsync) {
                const {
                    reject,
                    resolve
                } = extras;
                if (launchResponse) {
                    resetTimeout();
                    resolve(launchResponse);
                } else if (error) {
                    exit(options.onExit);
                    reject(error);
                }
            } else if (funcType === FuncType.launchWithoutContentAsync) {
                if (launchResponse) {
                    resetTimeout();
                    if (launchResponseResolve) {
                        launchResponseResolve(launchResponse);
                        return;
                    }
                } else if (error) {
                    exit(options.onExit);
                    if (launchResponseReject) {
                        launchResponseReject(error);
                    }
                }
            }
        } else if (e.data.startsWith(PostMessagePreferences)) {
            if (options.onPreferencesChanged && typeof options.onPreferencesChanged === 'function') {
                try {
                    options.onPreferencesChanged(e.data.substring(PostMessagePreferences.length));
                    return; // TODO: Yes?
                } catch {
                    // no-op?
                }
            }
        }
    };
}

function _makeSrcUrl(options: Options, funcType: FuncType): string {
    let src = '';
    if (funcType === FuncType.launchAsync) {
        src = 'reader?exitCallback=ImmersiveReader-Exit';
        if (options.cognitiveAppId) {
            src += '&cognitiveAppId=' + options.cognitiveAppId;
        }
    } else if (funcType === FuncType.launchWithoutContentAsync) {
        src = 'https://learningtools.onenote.com/learningtoolsapp/cognitive/reader?exitCallback=ImmersiveReader-Exit&skipearlygcm=true';
    }

    src += '&sdkPlatform=' + sdkPlatform + '&sdkVersion=' + sdkVersion;

    src += '&cookiePolicy=' + ((options.cookiePolicy === CookiePolicy.Enable) ? 'enable' : 'disable');

    if (options.hideExitButton) {
        src += '&hideExitButton=true';
    }

    if (options.uiLang) {
        src += '&omkt=' + options.uiLang;
    }

    return src;
}

function _generateIframeVariables(_parent: Node, useWebview: boolean, allowFullscreen: boolean): void {
    parent = _parent ? _parent : document.body;
    iframeContainer = document.createElement('div');
    iframe = useWebview ? <HTMLIFrameElement>document.createElement('webview') : document.createElement('iframe');
    iframe.allow = 'autoplay';
    iframe.title = 'Immersive Reader Frame';
    iframe.setAttribute('aria-modal', 'true');
    if (allowFullscreen) { // Style iframe
        iframe.setAttribute('allowfullscreen', '');
    }
    // Send an initial message to the webview so it has a reference to this parent window
    if (useWebview) {
        iframe.addEventListener('loadstop', () => {
            iframe.contentWindow.postMessage(JSON.stringify({ messageType: 'WebviewHost' }), '*');
        });
    }
    iframe.style.cssText = _parent ? 'position: static; width: 100%; height: 100%; left: 0; top: 0; border-width: 0' : 'position: static; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0';
    noscroll = document.createElement('style');
    noscroll.innerHTML = 'body{height:100%;overflow:hidden;}';
}

function _setIframeProps(src: string, optionParent: Node, uiZIndex: number): void {
    iframe.src = src;

    iframeContainer.style.cssText = optionParent ? `position: relative; width: 100%; height: 100%; border-width: 0; -webkit-perspective: 1px; z-index: ${uiZIndex}; background: white; overflow: hidden` : `position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0; -webkit-perspective: 1px; z-index: ${uiZIndex}; background: white; overflow: hidden`;

    iframeContainer.appendChild(iframe);
    parent.appendChild(iframeContainer);

    // Disable body scrolling
    document.head.appendChild(noscroll);
}

function resetTimeout(): void {
    if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
    }
}

function reset(): void {
    // Remove container along with the iframe inside of it
    if (parent.contains(iframeContainer)) {
        parent.removeChild(iframeContainer);
    }

    window.removeEventListener('message', messageHandler);

    // Clear the timeout timer
    resetTimeout();

    // Re-enable scrolling
    if (noscroll.parentNode) {
        noscroll.parentNode.removeChild(noscroll);
    }
}

function exit(onExit: Function): void {
    reset();
    // Execute exit callback if we have one
    if (onExit) {
        try {
            onExit();
        } catch {
            console.log('Error on exit');
        }
    }
}

/**
 * Launch the Immersive Reader within an iframe.
 * @param token The authentication token.
 * @param subdomain The Immersive Reader Cognitive Service subdomain. This is a required parameter for Azure AD authentication in this and future versions of this SDK. Use of the Cognitive Services issueToken endpoint-based authentication tokens is deprecated and no longer supported.
 * @param content The content that should be shown in the Immersive Reader.
 * @param options Options for configuring the look and feel of the Immersive Reader.
 * @return A promise that resolves with a LaunchResponse when the Immersive Reader is launched.
 */
export function launchAsync(token: string, subdomain: string, content: Content, options?: Options): Promise<LaunchResponse> {
    if (isLoading) {
        return Promise.reject('Immersive Reader is already launching');
    }

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

        isLoading = true;
        const startTime = Date.now();

        options = _initializeOptions(options);

        const extras: Extras = {
            content,
            subdomain,
            reject,
            resolve,
            startTime,
            token
        };

        messageHandler = _createMessageHandler(options, FuncType.launchAsync, extras);

        // Reset variables
        reset();

        window.addEventListener('message', messageHandler);

        // Reject the promise if the Immersive Reader page fails to load.
        timeoutId = window.setTimeout((): void => {
            reset();
            isLoading = false;
            reject({ code: ErrorCode.Timeout, message: `Page failed to load after timeout (${options.timeout} ms)` });
        }, options.timeout);

        const domain = options.customDomain ? options.customDomain : 'https://learningtools.onenote.com/learningtoolsapp/cognitive/';
        const src = domain + _makeSrcUrl(options, FuncType.launchAsync);

        _setIframeProps(src, options.parent, options.uiZIndex);

    });
}

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

    options = _initializeOptions(options);

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

    // TEST: will startime + options all be correctly referenced?
    const extras: Extras = {
        sendContentIfReady
    };

    messageHandler = _createMessageHandler(options, FuncType.launchAsync, extras);

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

    const src = _makeSrcUrl(options, FuncType.launchWithoutContentAsync);

    _setIframeProps(src, options.parent, options.uiZIndex);

    const launchWithoutContentResponse: LaunchWithoutContentResponse = {
        cancelAndCloseReader: () => exit(options.onExit),
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

export function resetLoadingForTest(): void {
    isLoading = false;
}

export function close(): void {
    window.postMessage('ImmersiveReader-Exit', '*');
}
