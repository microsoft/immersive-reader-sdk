// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// This script is used internally at Microsoft for testing-related purposes.

const fs = require('fs');
const replace = require('replace-in-file');

fs.copyFileSync('lib/immersive-reader-sdk.js', 'lib/immersive-reader-sdk.edog.js');

replace.sync({
    files: 'lib/immersive-reader-sdk.edog.js',
    from: /learningtools\.onenote\.com/g,
    to: 'learningtools.edog.onenote.com'
});