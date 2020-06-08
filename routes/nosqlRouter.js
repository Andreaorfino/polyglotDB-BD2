var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const getDb = require('../DB/noSQL/connector').getDb;

router.get('/', function (req, res, next) {

    const db = getDb();
    return db
      .collection('listingsAndReviews')
      .find({ _id: "10006546" })
      .next()
      .then(products => {
        console.log(products);
        return res.send(products);
      })
      .catch(err => {
        console.log(err);
      });
});

module.exports = router;
