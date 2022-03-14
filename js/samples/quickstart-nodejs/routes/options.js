var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('options', {title: "options"});
});

module.exports = router;
