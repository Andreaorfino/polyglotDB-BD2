var express = require('express');
var router = express.Router();

const db = require('../DB/SQL/connector');

router.get('/', function(req, res, next) {
    db.query('SELECT * FROM public.fatture', (err, result) => {
        console.log(err);
        res.send(result.rows);

        
    });

});

module.exports = router;
