var express = require('express');
var router = express.Router();
const neo4j = require('../DB/graph/connector');

router.get('/', (req, res, next ) =>{
    neo4j.run('MATCH (n:Customer2) RETURN n LIMIT 25')
        .then(result => {
/*             const resultField = [];
            result.records.forEach(record => {
                resultField.push(record._fields[0]);
            });
            console.log(resultField); */
            return res.send(result);
        })
        .catch(err => { console.log(err); });
});

module.exports = router;
