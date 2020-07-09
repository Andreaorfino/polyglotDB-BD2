var express = require('express');
var router = express.Router();

const getDb = require('../DB/noSQL/connector').getDb;
const postgres = require('../DB/SQL/connector');
const neo4j = require('../DB/graph/connector');
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
        return res.render('intermediaFattura', {invoiceno: invoiceno, title: "intermedia", customerid: customerid});
    })
})

/* intermedia per scegliere l'amico */
router.post('/3', function (req,res,next){
    const customerid = req.body.customerid;
    neo4j.run('MATCH (:Customer2 {CustomerID: ' + customerid + '})-[:F]->(c:Customer2) RETURN c.CustomerID')
        .then(result => {

            const resultField = [];
            result.records.forEach(record => {
                resultField.push(record._fields[0].low);
            });
            return res.render('intermediaAmico', {title:"Confronta dettagli amici", customerFriends: resultField, customerid: customerid});
        });
})

router.post('/4', function (req,res,next){
    const customerid1 = req.body.customer1;
    const customerid2 = req.body.customer2;
    let query = "SELECT * FROM utenti as u WHERE u.customerid="+customerid1+ " OR u.customerid="+customerid2;
    postgres.query(query, (err, result)=> {
        let amico1=result.rows[0];
        let amico2=result.rows[1];
        return res.render('confrontaAmici', {amico1: amico1, amico2: amico2, title:"Confronta Amici"});
    })
})

router.post('/1', function (req, res, next) {
    const invoiceno = req.body.invoiceno;
    const customerid = req.body.customerid;
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
                                        res.render('totaleFattura',{ count : results[0].count, customerid: customerid, fattura: invoiceno, title: "Totale Fattura"});
                                    });

                            });
                    });

                db.close();
            })




        });


});

module.exports = router;

