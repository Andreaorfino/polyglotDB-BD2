var express = require('express');
var router = express.Router();

const postgres = require('../DB/SQL/connector');

router.get('/', function(req, res, next) {
    postgres.query("SELECT fp.StockCode, fp.quantity FROM fatture AS f JOIN FattureProdotti AS fp on (f.InvoiceNo = fp.InvoiceNo) where f.InvoiceNo='536381';", (err, result) => {
        console.log(err);

        result.rows.forEach(row => {
            row.stockcode = row.stockcode.replace(/ /g,'');
        });

        res.send(result.rows);

        
    });

});

module.exports = router;

