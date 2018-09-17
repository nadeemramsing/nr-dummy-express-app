module.exports = async function () {
    const mongoose = require('mongoose').set('debug', true);

    // DATABASE CONNECTION
    const url = 'mongodb://localhost:27017/billingdb';

    const { connection, Schema } = await mongoose
        .connect(url, { useNewUrlParser: true })
        .catch(e => console.error('Connection failed: ', e));


    // SCHEMA DEFINITION    
    const billSchema = new Schema({
        billingArticle: {
            type: Schema.Types.ObjectId,
            ref: 'BillArticle'
        },
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
    await Bill.collection.drop();

    const options = { upsert: true, new: true, lean: true };

    const article1 = { name: 'Laptop', price: 10000 };
    const article2 = { name: 'PC', price: 20000 };
    const articleSaved1 = await Article.findOneAndUpdate(article1, { $set: article1 }, options);
    const articleSaved2 = await Article.findOneAndUpdate(article2, { $set: article2 }, options);

    const billingArticle1 = { article: articleSaved1._id, quantity: articleSaved1.price / 1000 };
    const billingArticle2 = { article: articleSaved2._id, quantity: articleSaved2.price / 1000 };
    const billingArticleSaved1 = await BillArticle.findOneAndUpdate(billingArticle1, { $set: billingArticle1 }, options);
    const billingArticleSaved2 = await BillArticle.findOneAndUpdate(billingArticle2, { $set: billingArticle2 }, options);

    const bill1 = { billingArticle: billingArticleSaved1._id, project: 'Danzéré', billNo: null };
    const bill2 = { billingArticle: billingArticleSaved2._id, project: 'Danzéré', billNo: null };
    const billingSaved1 = await Bill.findOneAndUpdate(bill1, { $set: bill1 }, { ...options, setDefaultsOnInsert: true });
    const billingSaved2 = await Bill.findOneAndUpdate(bill2, { $set: bill2 }, { ...options, setDefaultsOnInsert: true });

    // VIRTUAL POPULATE WITH SORTING
    // Getting Article from Bill: Bill -> BillArticle -> Article
    // For sorting based on populated field (e.g. 'billingArticle.article.price'), use aggregrate
    // Not yet supported in mongoose: see GitHub issue https://github.com/Automattic/mongoose/issues/2202
    Bill
        .find({ project: 'Danzéré' })
        .populate({ path: 'billingArticle', populate: { path: 'article' } })
        .then(bills => {
            debugger;
        })
        .catch(e => console.error(e))

    // LISTING ALL DOCUMENTS
    console.log('Bills', await Bill.find());
    console.log('BillArticles', await BillArticle.find());
    console.log('Articles: ', await Article.find());
}