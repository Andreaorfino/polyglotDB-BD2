var express = require('express');
var router = express.Router();

const getDb = require('../DB/noSQL/connector').getDb;
const postgres = require('../DB/SQL/connector');
const { notify } = require('./graphRouter');



/* calcolare totale di una fattura */
/* DONE */
router.post('/2', function (req,res,next){
    const customerid = req.body.customerid;
    let query = "SELECT f.InvoiceNo FROM fatture as f WHERE f.customerid="+customerid;
    postgres.query(query, (err, result)=> {
        const invoiceno=[];
        result.rows.forEach(row => {
            row.invoiceno = row.invoiceno.replace(/ /g, '');
            invoiceno.push(row.invoiceno);
        });
        return res.render('intermedia', {invoiceno: invoiceno, title: "intermedia"});
    })
})

router.post('/1', function (req, res, next) {
    const invoiceno = req.body.invoiceno;
    postgres.query("SELECT fp.StockCode, fp.quantity FROM fatture AS f JOIN FattureProdotti AS fp on (f.InvoiceNo = fp.InvoiceNo) where f.InvoiceNo='" + invoiceno + "';",
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

                        return db.collection('tmpcollection').aggregate([{
                            $lookup: { 'from': 'progetto', 'localField': 'stockcode', foreignField: 'stockcode', as: 'pricearray' }
                        },
                        { $match: { stockcode: { $in: stockcode } } },
                        { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$pricearray', 0] }, '$$ROOT'] } } },
                        { $group: { _id: null, count: { $sum: { $multiply: ['$unitprice', '$quantity'] } } } }])
                            .toArray(function (err, results) {

                                return db
                                    .collection('tmpcollection')
                                    .drop(function (err, delOK) {
                                        res.send({ count : results[0].count});
                                    });

                            });
                    });

                db.close();
            })




        });


});

module.exports = router;

