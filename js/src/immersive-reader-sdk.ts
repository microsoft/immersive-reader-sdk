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
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    let done = false;
    script.onload = (script as any).onreadystatechange = function () {
        // 'this' refers to the XMLHttpRequest scope, readyState is a property on 'this'
        // tslint:disable-next-line:no-invalid-this
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
            done = true;

            // Handle memory leak in IE
            script.onload = (script as any).onreadystatechange = null;
            if (head && script.parentNode) {
                head.removeChild(script);
            }
        }
    };

    head.appendChild(script);
}

export { renderButtons, close, launchAsync };