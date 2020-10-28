// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/getimmersivereadertoken', function(req, res) {
    request.post({
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: 'https://' + process.env.REGION + '.api.cognitive.microsoft.com/sts/v1.0/issueToken'
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