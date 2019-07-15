// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

function getImmersiveReaderTokenAsync() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/getimmersivereadertoken',
            type: 'GET',
            success: token => {
                resolve(token);
            },
            error: err => {
                console.log('Error in getting token!', err);
                reject(err);
            }
        });
    });
}

function getSubdomainAsync() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/subdomain',
            type: 'GET',
            success: subdomain => { resolve(subdomain); },
            error: err => { reject(err); }
        });
    });
}