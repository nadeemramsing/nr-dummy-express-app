module.exports = async function () {
    const mongoMock = require('mongo-mock');

    const { MongoClient } = mongoMock;
    MongoClient.persist = 'mongo.js';

    const url = 'mongodb://localhost:27017/nadeem';

    let db = null;
    try { db = await MongoClient.connect(url, {}) }
    catch (e) { console.log('Connection failed: ', e) }
}