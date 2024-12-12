var express = require('express');
var router = express.Router();

// routes/canvas.js
router.get('/', function(req, res, next) {
  var template = req.query.template;
  var width = req.query.width;
  var height = req.query.height;
  res.render('canvas.html', { template: template, width: width, height: height });
});

module.exports = router;