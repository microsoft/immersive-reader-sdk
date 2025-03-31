// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { renderButtons } from './renderButtons';
import { close, launchAsync } from './launchAsync';
import { CookiePolicy } from './options';

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        renderButtons();
    });
}

export { renderButtons, close, launchAsync, CookiePolicy };