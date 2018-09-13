module.exports = async function () {
    const mongoose = require('mongoose').set('debug', true);

    // DATABASE CONNECTION
    const url = 'mongodb://localhost:27017/billingdb';

    const { connection, Schema } = await mongoose
        .connect(url, { useNewUrlParser: true })
        .catch(e => console.error('Connection failed: ', e));


    // SCHEMA DEFINITION    
    const billSchema = new Schema({
        billingArticles: [{
            type: Schema.Types.ObjectId,
            ref: 'BillArticle'
        }],
        billNo: {
            type: Number
        },
        project: String
    });

    const Bill = mongoose.model('Bill', billSchema);

    /* ------------------------------------ */

    const billingArticleSchema = new Schema({
        article: {
            type: Schema.Types.ObjectId,
            ref: 'Article'
        },
        quantity: Number
    });

    const BillArticle = mongoose.model('BillArticle', billingArticleSchema);

    /* ------------------------------------ */

    const articleSchema = new Schema({
        name: String,
        price: Number
    });

    const Article = mongoose.model('Article', articleSchema);


    // DOCUMENTS CREATION
    const article = { name: 'Laptop', price: 10000 };
    const articleSaved = await Article.findOneAndUpdate(article, { $set: article }, { upsert: true, new: true, lean: true });

    const billingArticle = { article: articleSaved._id, quantity: articleSaved.price / 1000 };
    const billingArticleSaved = await BillArticle.findOneAndUpdate(billingArticle, { $set: billingArticle }, { upsert: true, new: true, lean: true });

    const bill = { billingArticles: [billingArticleSaved._id], project: 'Danzéré', billNo: null };
    const billingSaved = await Bill.findOneAndUpdate(bill, { $set: bill }, { upsert: true, new: true, lean: true, setDefaultsOnInsert: true });

    // VIRTUAL POPULATE WITH SORTING/*  */

    // LISTING ALL DOCUMENTS
    console.log('Bills', await Bill.find());
    console.log('BillArticles', await BillArticle.find());
    console.log('Articles: ', await Article.find());
}