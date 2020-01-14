// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// This script is used internally at Microsoft for testing-related purposes.

const fs = require('fs');
const replace = require('replace-in-file');

fs.copyFileSync('lib/immersive-reader-sdk.js', 'lib/immersive-reader-sdk.edog.js');
fs.copyFileSync('lib/immersive-reader-sdk.js', 'lib/immersive-reader-sdk.local.js');

replace.sync({
    files: 'lib/immersive-reader-sdk.edog.js',
    from: /cognitiveservices\.azure\.com/g,
    to: 'ppe.cognitiveservices.azure.com'
});

replace.sync({
    files: 'lib/immersive-reader-sdk.local.js',
    from: /https:\/\/learningtools\.onenote\.com\/learningtoolsapp\/cognitive\/reader/g,
    to: 'reader.html'
});

replace.sync({
    files: 'lib/immersive-reader-sdk.local.js',
    from: /https:\/\/contentstorage\.onenote\.office\.net\/onenoteltir\/permanent-static-resources\//g,
    to: ''
});