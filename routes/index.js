var express = require('express');
var router = express.Router();
const fs = require('fs');
const QueryFolder = './views/in_query';

const postgres = require('../DB/SQL/connector');

/* GET home page. */
router.get('/', function (req, res, next) {
  let querySQL1 = 'SELECT customerid FROM utenti;';
  return postgres.query(querySQL1, (err, result) => {
      const customerid = [];
      let cont = 0;
      result.rows.forEach(row => {
          if (cont < 50) {
              customerid.push(row.customerid);
              cont++;
          }
      });
      return res.render('index', { 
        title: 'Lightning',
        customerid: customerid
      });
  })
 

})

router.post('/', function (req, res, next) {
  const customerid = req.body.customerid;
  console.log(customerid);
  return res.render('presoUtente',{title: 'Query disponibili', customer: customerid});
})

router.get('/query', function (req, res, next) {
  const numberOfQueries = fs.readdirSync(QueryFolder).length;
  return res.render('query', { title: 'query', numberOfQueries: numberOfQueries });

})

router.get('/about', function (req, res, next) {
  return res.render('chisiamo', { title: 'About' });

})
module.exports = router;
