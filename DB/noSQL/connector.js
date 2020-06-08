const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

let _db;

const mongoConnect = callback => {
    MongoClient.connect(
        process.env.MONGO_CONNECT, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(client => {
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
