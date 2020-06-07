var express = require('express');
var path = require('path');
require('dotenv').config();

var indexRouter = require('./routes/index');
var sqlRouter = require('./routes/sqlRouter');
var nosqlRouter = require('./routes/nosqlRouter');

const db = require('./DB/SQL/connector');
const mongo = require('./DB/noSQL/connector');

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/sql', sqlRouter);
app.use('/nosql', nosqlRouter);

app.listen(process.env.PORT || process.env.DEV_PORT);



//TODO enviroment var V
//TODO deploy 
//TODO mongo query



