var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  return res.render('index', { title: 'Home' });

})

router.get('/query', function (req, res, next) {
  return res.render('query', { title: 'query' });

})

router.get('/chisiamo', function (req, res, next) {
  return res.render('chisiamo', { title: 'chisiamo' });

})
module.exports = router;
