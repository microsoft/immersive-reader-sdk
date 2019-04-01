// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var express = require('express');
var router = express.Router();
var request = require('request');

// Insert your Azure subscription key here
var cogSvcsSubscriptionKey = '';

// The location associated with the Immersive Reader resource.
// The following are valid values for the region:
// eastus, westus, northeurope, westeurope, centralindia, japaneast, japanwest, australiaeast
var cogSvcsRegion = '';

router.get('/getimmersivereadertoken', function(req, res) {
    request.post({
            headers: {
                'Ocp-Apim-Subscription-Key': cogSvcsSubscriptionKey,
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: 'https://' + cogSvcsRegion + '.api.cognitive.microsoft.com/sts/v1.0/issueToken'
        },
        function(err, resp, token) {
            if (err) {
                return res.status(500).send('CogSvcs IssueToken error');
            }

            return res.send(token);
        }
    );
});

module.exports = router;