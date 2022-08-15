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

function getSubdomainAsync() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: '/subdomain',
            type: 'GET',
            success: function (subdomain) { resolve(subdomain); },
            error: function (err) { reject(err); }
        });
    });
}

// The GetToken API endpoint should be secured behind some form of authentication (for example, OAuth) to prevent unauthorized users from obtaining tokens to use against your Immersive Reader service and billing; that work is beyond the scope of this sample.
function launchImmersiveReader(data, options) {
    getImmersiveReaderTokenAsync().then(function (token) {
        getSubdomainAsync().then(function (subdomain) {
            ImmersiveReader.launchAsync(token, subdomain, data, options).catch(function (error) {
                console.log('there was an error', error);
            });
        });
    });
}