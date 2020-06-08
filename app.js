var express = require('express');
var path = require('path');
require('dotenv').config();

var indexRouter = require('./routes/index');
var sqlRouter = require('./routes/sqlRouter');
var nosqlRouter = require('./routes/nosqlRouter');
var graphRouter = require('./routes/graphRouter');

const session = require('./DB/graph/connector');
const db = require('./DB/SQL/connector');
const mongo = require('./DB/noSQL/connector').mongoConnect;

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/aa', (req, res, next) => {
    return mongo
        .collection('sample_airbnb')
        .find({ _id: new mongodb.ObjectId("10006546") })
        .next()
        .then(out => {
            console.log(out);
            return res.send(out);
        })
        .catch(err => {
            console.log(err);
        });
});

app.use('/', indexRouter);
app.use('/sql', sqlRouter);
app.use('/nosql', nosqlRouter);
app.use('/graph', graphRouter);

mongo(() => {
    app.listen(process.env.PORT || process.env.DEV_PORT);
});


//TODO enviroment var V
//TODO deploy 
//TODO mongo query



