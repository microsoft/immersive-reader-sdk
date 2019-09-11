// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { renderButtons } from './renderButtons';
import { launchAsync, triggerImmersiveReaderExit } from './launchAsync';

window.addEventListener('load', () => {
    renderButtons();
});

export {renderButtons, launchAsync, triggerImmersiveReaderExit};