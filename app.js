//https://jsonplaceholder.typicode.com/comments
const
    _ = require('lodash'),
    data = require('./data'),
    express = require('express'),
    morgan = require('morgan'),

    app = express();

app.use(morgan('dev'));

//enableCors
app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token, x-client-id");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (req.method === 'OPTIONS') {
        res.end();
    } else
        next();
});

app.get('/api/comments', (req, res) => {
    var skip = parseInt(req.query.skip),
        limit = parseInt(req.query.limit),
        text = RegExp(req.query.searchText, 'i');

    res.send(
        _.chain(data)
            .filter(comment => comment.name.match(text) || comment.email.match(text) || comment.body.match(text))
            .drop(skip || 0)
            .take(limit || data.length)
            .value()
    );
});

app.get('/api/comments/count', (req, res) => {
    var text = RegExp(req.query.searchText, 'i'),
        result = _.filter(data, comment => comment.name.match(text) || comment.email.match(text) || comment.body.match(text));

    res.send({ count: result.length });
});

app.use('/api', (req, res) => {
    res.send('Welcome to Dummy RESTful API\n' + req.originalUrl);
});

var port = 4000;

var server = app.listen(port, () => {
    console.log('Express is listening on port: ' + port);
});

server.timeout = 120000; //2 min