var axios = require('axios');
var express = require('express');
var router = express.Router();
var qs = require('qs');
require('dotenv').config()

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        message: 'Ping /GetTokenAndSubdomain from your local app to fetch the creds.'
    })
});

router.get('/GetTokenAndSubdomain', async function (req, res) {
    var config = {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        }
    }
    var data = {
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        resource: 'https://cognitiveservices.azure.com/'
    };

    var url = `https://login.windows.net/${process.env.TENANT_ID}/oauth2/token`;
    try {
        const response = await axios.post(url, qs.stringify(data), config);
        var token = response.data.access_token;
        var subdomain = process.env.SUBDOMAIN;
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.json({ token, subdomain });
    } catch (response) {
        if (response.status !== 200) {
            return res.json({ error: "Unable to acquire Azure AD token. Check the debugger for more information." })
        }
    }
});

module.exports = router;
