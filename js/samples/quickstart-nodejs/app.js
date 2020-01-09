// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

require('dotenv').config();
var express = require('express');
var app = express();

var router = require('./routes');
app.use('/', router);
app.get('/favicon.ico', (req, res) => res.status(204)); // Prevent 404 for missing favicon

module.exports = app;