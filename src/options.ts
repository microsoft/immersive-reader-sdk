// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Options = {
    uiLang?: string; // Language of the Immersive Reader UI (e.g. 'en', 'es', 'zh')
    timeout?: number; // Duration (in milliseconds) before launchAsync fails with a timeout error
    uiZIndex?: number; // Z-index of the iframe that will be created (default is 1000)
}
