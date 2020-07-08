const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver('bolt://18.130.237.8', neo4j.auth.basic('neo4j', 'Luca_Andrea'));
const session = driver.session();

module.exports = session;

