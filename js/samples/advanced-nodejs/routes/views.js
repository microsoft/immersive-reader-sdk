// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var express = require('express');
var router = express.Router();
var path = require('path');
var viewRoot = path.join(__dirname, '../views');

router.get('/', function(req, res, next) {
  res.redirect('/sections');
});

router.get('/document', function(req, res, next) {
  res.sendFile('document.html', {root: viewRoot});
});

router.get('/math', function(req, res, next) {
  res.sendFile('math.html', {root: viewRoot});
});

router.get('/multilang', function(req, res, next) {
  res.sendFile('multilang.html', {root: viewRoot});
});

router.get('/sections', function(req, res, next) {
  res.sendFile('sections.html', {root: viewRoot});
});

router.get('/uilangs', function(req, res, next) {
  res.sendFile('uilangs.html', {root: viewRoot});
});

router.get('/hideexitbutton', function(req, res, next) {
  res.sendFile('hide-exit-button.html', {root: viewRoot});
});

router.get('/inner-hide-exit-button', function(req, res, next) {
  res.sendFile('inner-hide-exit-button.html', {root: viewRoot});
});

module.exports = router;
