// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { renderButtons } from './renderButtons';
import { close, launchAsync } from './launchAsync';
import { CookiePolicy } from './options';

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (!(window.hasOwnProperty('Promise'))) {
            dynamicallyLoadScript('https://contentstorage.onenote.office.net/onenoteltir/permanent-static-resources/promise-polyfill.min.js');
        }

        renderButtons();
    });
}

function dynamicallyLoadScript(scriptUrl: string) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.head.appendChild(script);
}

export { renderButtons, close, launchAsync, CookiePolicy };