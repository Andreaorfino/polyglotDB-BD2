const mongodb = require('mongodb');
require('dotenv').config();
const MongoClient = mongodb.MongoClient;

const mongoConnect = callback => {
    MongoClient.connect(
        process.env.MONGO_CONNECT, {
        useUnifiedTopology: true,
        useNewUrlParser: true
  }
  )
    .then(client => {
            callback(client);
        })
    .catch(err => {
        console.log(err);
    });
};

module.exports = mongoConnect;
