// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Options = {
    uiLang?: string;           // Language of the UI, e.g. en, es-ES (optional). Defaults to browser language if not specified.
    timeout?: number;          // Duration (in milliseconds) before launchAsync fails with a timeout error (default is 15000 ms).
    uiZIndex?: number;         // Z-index of the iframe that will be created (default is 1000).
    useWebview?: boolean;      // Use a webview tag instead of an iframe, for compatibility with Chrome Apps (default is false).
    onExit?: () => any;        // Executes when the Immersive Reader exits.
    customDomain?: string;     // Reserved for internal use. Custom domain where the Immersive Reader webapp is hosted (default is null).
    allowFullscreen?: boolean; // The ability to toggle fullscreen (default is true).
    hideExitButton?: boolean;  // Whether or not to hide the Immersive Reader's exit button arrow (default is false). This should only be true if there is an alternative mechanism provided to exit the Immersive Reader (e.g a mobile toolbar's back arrow).
    cookiePolicy?: CookiePolicy;         // Setting for the Immersive Reader's cookie usage (default is CookiePolicy.Disable). It's the responsibility of the host application to obtain any necessary user consent in accordance with EU Cookie Compliance Policy.
    disableFirstRun?: boolean;           // Disable the first run experience.
    readAloudOptions?: ReadAloudOptions; // Options to configure Read Aloud.
    internalOptions?: InternalOptions;   // Options reserved for internal use.
};

export enum CookiePolicy { Disable, Enable }

export type ReadAloudOptions = {
    voice?: string;      // Voice, either 'male' or 'female'. Note that not all languages support both genders.
    speed?: number;      // Playback speed, must be between 0.5 and 2.5, inclusive.
    autoplay?: boolean;  // Automatically start Read Aloud when the Immersive Reader loads.
};

export type InternalOptions = {
    messageOptions?: [Option],  // Reserved for internal use. Additional options to be sent through Content message.
    queryParameters?: [Option]  // Reserved for internal use. Additional query parameters.
};

export type Option = {
    option: string, // Reserved for internal use. Option key word.
    value: boolean | string // Reserved for internal use. Option value.
};