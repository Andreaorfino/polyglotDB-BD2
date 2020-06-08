var express = require('express');
var router = express.Router();

const postgres = require('../DB/SQL/connector');

router.get('/', function(req, res, next) {
    postgres.query('SELECT * FROM public.fatture', (err, result) => {
        console.log(err);
        res.send(result.rows);

        
    });

});

module.exports = router;
