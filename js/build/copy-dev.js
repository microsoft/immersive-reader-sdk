// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// This script copies the locally built immersive-reader-sdk.js file to the supplied --outPath

const fs = require('fs');

const outPathIndex = process.argv.indexOf('--outPath');

if (outPathIndex == -1) {
    return;
}

const outPath = process.argv[outPathIndex + 1];

fs.copyFileSync('lib/immersive-reader-sdk.js', outPath);