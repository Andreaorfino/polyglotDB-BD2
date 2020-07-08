var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const postgres = require('../DB/SQL/connector');
const getDb = require('../DB/noSQL/connector').getDb;

router.get('/', function (req, res, next) {

    const db = getDb();
    return db
      .collection('progetto')
      .find()
      .toArray()
      .then(products => {
        return res.send(products);
      })
      .catch(err => {
        console.log(err);
      });
});

router.get('/query1', function (req, res, next) {

  postgres.query("SELECT fp.StockCode, fp.quantity FROM fatture AS f JOIN FattureProdotti AS fp on (f.InvoiceNo = fp.InvoiceNo) where f.InvoiceNo='536381';", (err, result) => {
    

    result.rows.forEach(row => {
        row.stockcode = row.stockcode.replace(/ /g,'');
    });
  });

  const db = getDb();
  
  
  return db.collection('tmpcollection').aggregate([{
    $lookup:{'from' : 'progetto', 'localField': 'stockcode', foreignField: 'stockcode', as: 'pricearray'}},
    {$match:{stockcode:{$in:['22083','22086']}}},
    {$replaceRoot: {newRoot: {$mergeObjects:[{$arrayElemAt:['$pricearray',0]},'$$ROOT']}}},
    {$group:{_id:null, count:{$sum:{$multiply:['$unitprice','$quantity']}}}}])
    .toArray(function(err, results) {
    console.log(results);
    res.send(results);
  });

});

module.exports = router;
