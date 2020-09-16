// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

function getImmersiveReaderTokenAsync() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: '/getimmersivereadertoken',
            type: 'GET',
            success: function (token) {
                resolve(token);
            },
            error: function (err) {
                console.log('Error in getting token!', err);
                reject(err);
            }
        });
    });
}

function launchImmersiveReader(data, options) {
    getImmersiveReaderTokenAsync().then(function (token) {
        // The Office compliant v0.0.1 token does not require a subdomain, use null instead.
        ImmersiveReader.launchAsync(token, null, data, options).catch(function (error) {
            console.log('there was an error', error);
        });
    });
}