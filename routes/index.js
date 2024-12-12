var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'PixelMalina' });
});

module.exports = router;
