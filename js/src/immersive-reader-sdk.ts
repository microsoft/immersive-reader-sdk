// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { renderButtons } from './renderButtons';
import { close, launchAsync } from './launchAsync';

window.addEventListener('load', () => {
    if (!('Promise' in window)) {
        dynamicallyLoadScript('https://contentstorage.onenote.office.net/onenoteltir/permanent-static-resources/promise-polyfill.min.js');
    }

    renderButtons();
});

function dynamicallyLoadScript(scriptUrl: string) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    document.head.appendChild(script);
}

export { renderButtons, close, launchAsync };