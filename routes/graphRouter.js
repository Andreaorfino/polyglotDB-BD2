var express = require('express');
var router = express.Router();
const neo4j = require('../DB/graph/connector');
const postgres = require('../DB/SQL/connector');
const getDb = require('../DB/noSQL/connector').getDb;

/* query per controllare quali prodotti ha acquistato un cliente che hanno acquistato almeno uno dei suoi amici */
/* DONE */
router.post('/k', (req, res, next) => {
    const customeridChiamante = req.body.customerid;
    neo4j.run('MATCH (:Customer2 {CustomerID: ' + customeridChiamante + '})-[:F]->(c:Customer2) RETURN c.CustomerID')
        .then(result => {

            const resultField = [];
            result.records.forEach(record => {
                resultField.push(record._fields[0].low);
            });
            let querySQL1 = 'SELECT stockcode, customerid FROM fatture AS f JOIN fattureprodotti AS fp on f.invoiceno = fp.invoiceno WHERE ';
            let querySQL2 = 'SELECT stockcode, customerid FROM fatture AS f JOIN fattureprodotti AS fp on f.invoiceno = fp.invoiceno WHERE ';
            for (let i = 0; i < resultField.length; i++) {
                if (i == 0) {
                    querySQL1 = querySQL1 + 'customerid=' + resultField[i];
                } else {
                    querySQL1 = querySQL1 + ' or customerid=' + resultField[i];
                }
            }



            return postgres.query(querySQL1, (err, result1) => {
                querySQL2 = querySQL2 + 'customerid=' + customeridChiamante;
                return postgres.query(querySQL2, (err, result2) => {

                    const intersection = [];

                    const stockcode2 = [];
                    result2.rows.forEach(row => {
                        row.stockcode = row.stockcode.replace(/ /g, '');
                        stockcode2.push(row.stockcode);
                    });

                    const stockcode1 = [];
                    result1.rows.forEach(row => {
                        row.stockcode = row.stockcode.replace(/ /g, '');
                        stockcode1.push(row);
                    });

                    for (let i = 0; i < stockcode1.length; i++) {
                        const element = stockcode1[i];
                        let stock = element.stockcode;
                        let userid = element.customerid;
                        if (stockcode2.includes(stock)) { intersection.push({ stock: stock, userid: userid }) }

                    }


                    const out = [];
                    intersection.forEach(element => {
                        let trovato = false
                        for (let i = 0; i < out.length; i++) {
                            if (element.userid == out[i].userid) {
                                trovato = true;
                                if (!out[i].stocks.includes(element.stock)) {
                                    out[i].stocks.push(element.stock); 
                                } 
                            }
                        }
                        if (!trovato) {
                            out.push({ userid: element.userid, stocks: [element.stock] })
                        }


                    });

                    return res.render('prodottiComuni', { intersection: out, title: "Prodotti comuni", customerid: customeridChiamante });

                });
            });

        })
        .catch(err => { console.log(err); });
});

/* query per vedere quale amico di un cliente ha speso di più */
/* DONE */
router.post('/a', (req, res, next) => {
    /* id del chiamante */
    const customeridChiamante = req.body.customerid;

    /* query neo4j con per prendere tutti gli amici del customer di cui si ha l'id */
    neo4j.run('MATCH (:Customer2 {CustomerID: ' + customeridChiamante + '})-[:F]->(c:Customer2) RETURN c.CustomerID')
        .then(result => {

            /* tutti i customerid amici vengono messi dentro resuk */
            const arrayCustomerIdFriends = [];
            result.records.forEach(record => {
                arrayCustomerIdFriends.push(record._fields[0].low);
            });

            let querySQL1 = 'SELECT stockcode, quantity, customerid FROM fatture AS f JOIN fattureprodotti AS fp on f.invoiceno = fp.invoiceno WHERE ';

            /* array con tutte le promise che ritornano le fatture di tutti gli amici */
            const arrayPromiseFriendsOrder = [];

            for (let i = 0; i < arrayCustomerIdFriends.length; i++) {
                let querySQL2 = querySQL1 + 'customerid=' + arrayCustomerIdFriends[i];
                arrayPromiseFriendsOrder.push(new Promise((resolve, reject) => {
                    postgres.query(querySQL2, (err, result) => {
                        resolve(result.rows);
                    });
                }))
            }

            Promise.all(arrayPromiseFriendsOrder).then(data => {
                /* data array con gli output delle query */

                const AllMongoQuery = []

                for (let i = 0; i < data.length; i++) {

                    /* si selezionano i vari stockcode e l'utente */
                    let user; const stockcode = [];

                    data[i].forEach(row => {
                        row.stockcode = row.stockcode.replace(/ /g, '');
                        stockcode.push(row.stockcode);
                        user = row.customerid;
                    });

                    /* per ogni  */
                    AllMongoQuery.push(new Promise(resolve => {
                        const randString = Math.random() + '-' + i;
                        const db = getDb();
                        db.createCollection("tmpcollection" + randString, function (err, resu) {
                            db.collection('tmpcollection' + randString).insertMany(data[i])
                                .then(result2 => {
                                    db.collection('tmpcollection' + randString).aggregate([{
                                        $lookup: { 'from': 'progetto', 'localField': 'stockcode', foreignField: 'stockcode', as: 'pricearray' }
                                    },
                                    { $match: { stockcode: { $in: stockcode } } }, /* si potrebbe togliere */
                                    { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$pricearray', 0] }, '$$ROOT'] } } },
                                    { $group: { _id: null, count: { $sum: { $multiply: ['$unitprice', '$quantity'] } } } }])
                                        .toArray(function (err, results) {
                                            db.collection('tmpcollection' + randString)
                                                .drop(function (err, delOK) {
                                                    resolve({ count: results[0].count, user: user });
                                                });
                                        });
                                });
                        })
                    }));
                }

                Promise.all(AllMongoQuery).then(totaleSpesa => {
                    let max = { count: 0, user: '' };
                    console.log(totaleSpesa);
                    totaleSpesa.forEach(unaSpesa => {
                        if (max.count < unaSpesa.count) {
                            max.count = unaSpesa.count;
                            max.user = unaSpesa.user;
                        }
                    })

                    return res.render('amicoSpendaccione', { title: "Amico Spendaccione", max: max });
                });
            })

        })
        .catch(err => { console.log(err); });
});

/* vedere attribbuto più comune acquistato da un utente */
/* TODO TEST trovare il massimo */
router.post('/b', (req, res, next) => {
    const customeridChiamante = req.body.customerid;

    let querySQL1 = 'SELECT stockcode FROM fatture AS f JOIN fattureprodotti AS fp on f.invoiceno = fp.invoiceno WHERE customerid=' + customeridChiamante;
    return postgres.query(querySQL1, (err, result) => {

        const db = getDb();


        const stockcode = []
        result.rows.forEach(row => {
            row.stockcode = row.stockcode.replace(/ /g, '');
            stockcode.push(row.stockcode);
        });


        db.collection('progetto').aggregate([{ $match: { stockcode: { $in: stockcode } } }, { $unset: ['_id','stockcode','unitprice'] }])
            .toArray((err, risultato) => {

                let map = {};

                for (let element in risultato) {
                    for (let key in risultato[element]) {
                        if (key in map) {
                            map[key].count = map[key].count + 1;
                            map[key].valori.push(risultato[element][key]);
                        } else {
                            map[key] = { count: 1, prodotti: key, valori: [risultato[element][key]]};
                        }
                    }
                }

                function compare( a, b ) {
                    if ( a.count < b.count ){
                      return 1;
                    }
                    if ( a.count > b.count ){
                      return -1;
                    }
                    return 0;
                  }
                  let mappina =[];
                  for (let key in map) {
                      mappina.push({count: map[key].count, valori: map[key].valori, prodotti:map[key].prodotti});
                  }
                  mappina.sort( compare );

/*                 let max = 0;
                let prodotti = [];
                for (let key in map) {
                    if (max < key.count) {
                        max = key.count; max.prodotti = key.prodotti;
                    }
                } */


                return res.render('piuFrequenti',{ map: mappina.slice(0,10),title:"le più frequenti", risultato: risultato, stockcode: stockcode, customerid:customeridChiamante     });

            });

    });
});

/* query per far tornare tutti i codici utenti */
router.get('/c', (req, res, next) => {
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
        return res.send(customerid);
    })
})



module.exports = router;