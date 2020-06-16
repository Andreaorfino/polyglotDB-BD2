var express = require('express');
var router = express.Router();
const fs = require('fs');
const QueryFolder = './views/in_query';

/* GET home page. */
router.get('/', function (req, res, next) {
  return res.render('index', { title: 'Home' });

})

router.get('/query', function (req, res, next) {
  const numberOfQueries = fs.readdirSync(QueryFolder).length;
  return res.render('query', { title: 'query', numberOfQueries: numberOfQueries });

})

router.get('/chisiamo', function (req, res, next) {
  return res.render('chisiamo', { title: 'chisiamo' });

})
module.exports = router;
