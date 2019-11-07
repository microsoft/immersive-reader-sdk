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