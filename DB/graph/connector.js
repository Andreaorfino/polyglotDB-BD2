const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('admin', 'neo4j'));
const session = driver.session();

module.exports = session;

