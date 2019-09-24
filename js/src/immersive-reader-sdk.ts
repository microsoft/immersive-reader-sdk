// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { renderButtons } from './renderButtons';
import { close, launchAsync } from './launchAsync';

window.addEventListener('load', () => {
    renderButtons();
});

export {renderButtons, close, launchAsync};