// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var express = require('express');
var router = express.Router();
var request = require('request');
var path = require('path');

var viewRoot = path.join(__dirname, './views');

router.get('/', function(req, res, next) {
    res.sendFile('index.html', {root: viewRoot});
});

router.get('/GetTokenAndSubdomain', function(req, res) {
    request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: `https://login.windows.net/${process.env.TENANT_ID}/oauth2/token`,
            form: {
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                resource: 'https://cognitiveservices.azure.com/'
            }
        },
        function(err, resp, tokenResult) {
            if (err) {
                console.log(err);
                return res.status(500).send('CogSvcs IssueToken error');
            }

            var tokenResultParsed = JSON.parse(tokenResult);
            
            if (tokenResultParsed.error) {
                console.log(tokenResult);
                return res.send({error :  "Unable to acquire Azure AD token. Check the debugger for more information."})
            }

            var token = tokenResultParsed.access_token;
            var subdomain = process.env.SUBDOMAIN;
            return res.send({token, subdomain});
        }
    );
});

module.exports = router;