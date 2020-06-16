var express = require('express');
var path = require('path');
require('dotenv').config();

var indexRouter = require('./routes/index');
var sqlRouter = require('./routes/sqlRouter');
var nosqlRouter = require('./routes/nosqlRouter');
var graphRouter = require('./routes/graphRouter');
var queryRouter = require('./routes/queryRouter');

const session = require('./DB/graph/connector');
const db = require('./DB/SQL/connector');

/* const mongo = require('./DB/noSQL/connector').mongoConnect; */

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/', indexRouter);
app.use('/sql', sqlRouter);
app.use('/nosql', nosqlRouter);
app.use('/graph', graphRouter);
app.use('/query', queryRouter);

app.listen(process.env.PORT || process.env.DEV_PORT);

/* mongo(() => {
    
});

 */