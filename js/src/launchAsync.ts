// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Content } from './content';
import { CookiePolicy, DisplayOptions, InternalOptionDictionary, Options, ReadAloudOptions, StyleOverrideOptions, TranslationOptions } from './options';
import { Error, ErrorCode } from './error';
import { LaunchResponse } from './launchResponse';
declare const VERSION: string;

type Message = {
    cogSvcsAccessToken: string;
    cogSvcsSubdomain: string;
    request: Content;
    launchToPostMessageSentDurationInMs: number;
    disableFirstRun?: boolean;
    readAloudOptions?: ReadAloudOptions;
    translationOptions?: TranslationOptions;
    displayOptions?: DisplayOptions;
    sendPreferences?: boolean;
    preferences?: string;
    internalOptions?: InternalOptionDictionary;
    disableGrammar?: boolean;
    disableTranslation?: boolean;
    disableLanguageDetection?: boolean;
};

type LaunchResponseMessage = {
    success: boolean;
    errorCode?: ErrorCode;
    sessionId: string;
    meteredContentSize?: number;
    gcmCorrelationId?: string;
};

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
let readerReadyDuration: number = 0;
let launchStart: number = 0;
let gcmCorrelationId: string = null;
let launchResponseError: Error;
let windowObject: Window = window;

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

        if (options && options.launchMode) {
            if (options.launchMode === 'reading' && !options.onReceiveReadingPracticeMessage) {
                reject({ code: ErrorCode.BadArgument, message: 'onReceiveReadingPracticeMessage must not be null for reading mode' });
                return;
            }
        }

        if (options?.useWebview2 && !!!options?.parent) {
            reject({ code: ErrorCode.BadArgument, message: 'Parent must not be null when useWebview2 is specified' });
            return;
        }

        if (!isValidSubdomain(subdomain) && (!options || !options.customDomain)) {
            reject({ code: ErrorCode.InvalidSubdomain, message: errorMessageMap[ErrorCode.InvalidSubdomain] });
            return;
        }

        isLoading = true;
        const startTime = Date.now();
        launchResponseError = null;
        options = {
            uiZIndex: 1000,
            timeout: 15000,  // Default to 15 seconds
            useWebview: false,
            allowFullscreen: true,
            hideExitButton: false,
            cookiePolicy: CookiePolicy.Disable,
            useWebview2: false,
            ...options
        };

        // Ensure that we were given a number for the UI z-index
        if (!options.uiZIndex || typeof options.uiZIndex !== 'number') {
            options.uiZIndex = 1000;
        }

        let timeoutId: number | null = null;
        const styleOverrides: StyleOverrideOptions = options.internalOptions?.styleOverrides;
        const iframeContainer: HTMLDivElement = document.createElement('div');
        const iframe: HTMLIFrameElement = options.useWebview ? <HTMLIFrameElement>document.createElement('webview') : document.createElement('iframe');
        iframe.allow = 'autoplay; microphone';
        iframe.title = 'Immersive Reader Frame';
        iframe.setAttribute('aria-modal', 'true');
        const noscroll: HTMLStyleElement = document.createElement('style');
        noscroll.innerText = 'body{height:100%;overflow:hidden;}';
        if (options.internalOptions?.styleOverrides?.nonce && options.internalOptions?.styleOverrides?.nonce !== '') {
            noscroll.setAttribute('nonce', options.internalOptions?.styleOverrides.nonce);
        }

        const resetTimeout = (): void => {
            if (timeoutId) {
                windowObject.clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        let parent: Node = null;
        if (options.useWebview2) {
            parent = options.parent;
        } else {
            parent = options.parent && document.contains(options.parent) ? options.parent : document.body;
        }

        const reset = (): void => {
            // Remove container along with the iframe inside of it
            if (parent.contains(iframeContainer)) {
                parent.removeChild(iframeContainer);
            }

            windowObject.removeEventListener('message', messageHandler);

            // Clear the timeout timer
            resetTimeout();

            // Re-enable scrolling
            if (noscroll.parentNode) {
                noscroll.parentNode.removeChild(noscroll);
            }
        };

        const exit = (): void => {
            reset();
            isLoading = false;

            // Execute exit callback if we have one
            if (options.onExit) {
                try {
                    options.onExit();
                } catch {
                    // No-op
                }
            }
        };

        function receiveReadingPracticeMessage(onReceiveReadingPracticeMessage: Function, readingPracticeMessage: any): void {
            // Execute callback if we have one and send the report
            if (onReceiveReadingPracticeMessage) {
                onReceiveReadingPracticeMessage(readingPracticeMessage);
            }
        }

        // Reset variables
        reset();

        if (options.useWebview2) {
            const doc = parent.ownerDocument;
            const win = doc.defaultView;
            windowObject = win;
        }

        const messageHandler = (e: any): void => {
            // Process valid object messages coming from the practice pronunciation experience
            if (e && e.data && typeof e.data === 'object' && 'command' in e.data) {
                receiveReadingPracticeMessage(options.onReceiveReadingPracticeMessage, e.data);
                return;
            }

            // Don't process the message if the data is not a string
            if (!e || !e.data || typeof e.data !== 'string') { return; }

            if (e.data === 'ImmersiveReader-ReadyForContent') {
                resetTimeout(); // Reset the timeout once the reader page loads successfully. The Reader page will report further errors through PostMessage if there is an issue obtaining the ContentModel from the server
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
                    preferences: options.preferences,
                    internalOptions: options.internalOptions?.messageOptions,
                    disableTranslation: options.disableTranslation,
                    disableGrammar: options.disableGrammar,
                    disableLanguageDetection: options.disableLanguageDetection
                };
                readerReadyDuration = Date.now() - startTime;
                launchStart = startTime;
                iframe.contentWindow!.postMessage(JSON.stringify({ messageType: 'Content', messageValue: message }), '*');
            } else if (e.data === 'ImmersiveReader-Exit') {
                exit();
            } else if (e.data.startsWith(PostMessageLaunchResponse)) {
                let launchResponse: LaunchResponse = null;
                let error: Error = null;

                let response: LaunchResponseMessage = null;
                try {
                    response = JSON.parse(e.data.substring(PostMessageLaunchResponse.length));
                    // Keep GCM correlation Id available to return in case of any error
                    gcmCorrelationId = response.gcmCorrelationId;
                } catch {
                    // No-op
                }

                if (response && response.success) {

                    launchResponse = {
                        container: iframeContainer,
                        sessionId: response.sessionId,
                        charactersProcessed: response.meteredContentSize,
                        readerReadyDuration,
                        launchDuration: Date.now() - launchStart,
                        gcmCorrelationId: response.gcmCorrelationId
                    };
                } else if (response && !response.success) {
                    error = {
                        code: response.errorCode,
                        message: errorMessageMap[response.errorCode],
                        sessionId: response.sessionId,
                        readerReadyDuration,
                        gcmCorrelationId: response.gcmCorrelationId,
                        launchDuration: 0
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
                    resolve(launchResponse);
                } else if (error) {
                    exit();
                    reject(error);
                }
            } else if (e.data.startsWith(PostMessagePreferences)) {
                if (options.onPreferencesChanged && typeof options.onPreferencesChanged === 'function') {
                    try {
                        options.onPreferencesChanged(e.data.substring(PostMessagePreferences.length));
                    } catch {
                        // No-op
                    }
                }
            }
        };
        windowObject.addEventListener('message', messageHandler);

        // Reject the promise if the Immersive Reader page fails to load.
        timeoutId = windowObject.setTimeout((): void => {
            reset();
            isLoading = false;
            if (launchResponseError) {
                reject(launchResponseError);
            } else {
                reject({
                    code: ErrorCode.Timeout,
                    message: `Page failed to load after timeout (${options.timeout} ms)`,
                    readerReadyDuration,
                    gcmCorrelationId,
                    launchDuration: 0
                });
            }
        }, options.timeout);

        // Create and style iframe
        if (options.allowFullscreen) {
            iframe.setAttribute('allowfullscreen', '');
        }

        const { iframeStyleOverrides } = options.internalOptions?.styleOverrides || {};
        if (!!iframeStyleOverrides) {
            iframe.style.cssText = iframeStyleOverrides;
        } else {
            iframe.style.cssText = options.parent ? 'position: static; width: 100%; height: 100%; left: 0; top: 0; border-width: 0' : 'position: static; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0';
        }

        // Send an initial message to the webview so it has a reference to this parent window
        if (options.useWebview) {
            iframe.addEventListener('loadstop', () => {
                iframe.contentWindow.postMessage(JSON.stringify({ messageType: 'WebviewHost' }), '*');
            });
        }

        const domain = options.customDomain ? options.customDomain : `https://${subdomain}.cognitiveservices.azure.com/immersivereader/webapp/v1.0/`;
        let src = domain + 'reader?exitCallback=ImmersiveReader-Exit&sdkPlatform=' + sdkPlatform + '&sdkVersion=' + sdkVersion;

        src += '&cookiePolicy=' + ((options.cookiePolicy === CookiePolicy.Enable) ? 'enable' : 'disable');

        if (options.hideExitButton) {
            src += '&hideExitButton=true';
        }

        if (options.uiLang) {
            src += '&omkt=' + options.uiLang;
        }

        if (options.launchMode) {
            src += `&launchMode=${options.launchMode}`;
        }

        const queryParameters: InternalOptionDictionary = options?.internalOptions?.queryParameters;
        for (const parameterName in queryParameters) {
            src += '&' + parameterName + '=' + queryParameters[parameterName];
        }

        // const { internalOptions } = options || {};
        // const { styleOverrides } = internalOptions || {};

        iframe.src = src;

        if (!!styleOverrides?.iframeContainerStyleOverrides) {
            iframeContainer.style.cssText = styleOverrides?.iframeContainerStyleOverrides;
        } else {
            iframeContainer.style.cssText = options.parent ? `position: relative; width: 100%; height: 100%; border-width: 0; -webkit-perspective: 1px; z-index: ${options.uiZIndex}; background: white; overflow: hidden` : `position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; border-width: 0; -webkit-perspective: 1px; z-index: ${options.uiZIndex}; background: white; overflow: hidden`;
        }

        iframeContainer.appendChild(iframe);
        parent.appendChild(iframeContainer);

        // Disable body scrolling
        document.head.appendChild(noscroll);

        if (launchResponseError) {
            reject(launchResponseError);
            return;
        }
    });
}

export function close(): void {
    windowObject.postMessage('ImmersiveReader-Exit', '*');
}

// The subdomain must be alphanumeric, and may contain '-',
// as long as the '-' does not start or end the subdomain.
export function isValidSubdomain(subdomain: string): boolean {
    if (!subdomain) {
        return false;
    }

    const validRegex = '^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9]\.privatelink)$';
    const regExp = new RegExp(validRegex);

    return regExp.test(subdomain);
}