// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

require('dotenv').config();
var express = require('express');
var path = require('path');

var viewsRouter = require('./routes/views');
var requestsRouter = require('./routes/requests');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'))

app.use('/', viewsRouter);
app.use('/', requestsRouter);

module.exports = app;