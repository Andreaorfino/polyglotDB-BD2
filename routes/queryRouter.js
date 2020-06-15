var express = require('express');
var router = express.Router();

const getDb = require('../DB/noSQL/connector').getDb;
const postgres = require('../DB/SQL/connector');

router.get('/1', function (req, res, next) {
    postgres.query("SELECT fp.StockCode, fp.quantity FROM fatture AS f JOIN FattureProdotti AS fp on (f.InvoiceNo = fp.InvoiceNo) where f.InvoiceNo='536381';",
        (err, result) => {

            /* rimuovi spazi e salvo tutti gli stock code */
            const stockcode = []
            result.rows.forEach(row => {
                row.stockcode = row.stockcode.replace(/ /g, '');
                stockcode.push(row.stockcode);
            });

            const db = getDb();
            return db.createCollection("tmpcollection", function (err, resu) {
                return db.collection('tmpcollection').insertMany(result.rows)
                    .then(result2 => {

                        

                        return db
                            .collection('tmpcollection')
                            .drop(function (err, delOK) {   
                                res.send('tutto ok');
                            });
                    });

                db.close();
            })




        });


});

module.exports = router;

