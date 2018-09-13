module.exports = async function () {
    const mongoose = require('mongoose');

    const url = 'mongodb://localhost:27017/billingdb';

    const { connection, Schema } = await mongoose
        .connect(url, { useNewUrlParser: true })
        .catch(e => console.error('Connection failed: ', e));


    const billSchema = new Schema({

    });

    const billingArticleSchema = new Schema({

    });

    const articleSchema = new Schema({

    });
}