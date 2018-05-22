//https://jsonplaceholder.typicode.com/comments
const
    _ = require('lodash'),
    bodyParser = require('body-parser'),
    express = require('express'),
    morgan = require('morgan'),
    jsonfile = require('jsonfile'),

    //RxJS
    //rxjs-compat needed
    { of } = require('rxjs/observable/of'),
    //Use 'operators' (NOT 'operator'); ELSE 'Cannot read property 'lift' of undefined'
    //~Observable operators (NOT Value/Array/Object operators); useful when dealing with multiple Observables merged together
    { filter } = require('rxjs/operators/filter'),
    { mergeAll } = require('rxjs/operators/mergeAll'),
    { skip } = require('rxjs/operators/skip'),
    { take } = require('rxjs/operators/take'),

    app = express();

const config = {
    jsonPath: './data.json'
};

let data = [];
jsonfile.readFile(config.jsonPath, (err, json) => data = json);

app.use(morgan('dev'));
app.use(bodyParser.json());

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

app.get('/api/comments/count', (req, res) => {
    const
        text = RegExp(req.query.searchText, 'i'),
        result = _.filter(data, comment => comment.name.match(text) || comment.email.match(text) || comment.body.match(text));

    res.send({ count: result.length });
});

app.get('/api/comments', (req, res) => {
    const
        skipInt = parseInt(req.query.skip),
        limitInt = parseInt(req.query.limit),
        text = RegExp(req.query.searchText, 'i');

    let comments = [];

    //In newer versions of RxJS, operators (such as map, filter, reduce) are pure functions (not available as property in Observable instance)
    return of(data)
        //.pipe(observable => null) //MUST return an Observable; ELSE 'Cannot read property 'pipe' of null...

        /* 
        -mergeAll: does not preserve order ~parallel
        -concatAll: preserves order BUT waits for previous observable to finish before processing the next one (~sequential/series)

        => IF async, use concatAll; ELSE use mergeAll
        */
        .pipe(
            mergeAll(),
        //IF filter, skip, take are placed here, they won't be processed => since, in this pipe, there is still one Observable 
        //Only in the next pipe with mergeAll return each item in the array as individual Observables
    )
        .pipe(
            filter(comment => comment.name.match(text) || comment.email.match(text) || comment.body.match(text))
        )
        .pipe(
            skip(skipInt || 0)
        )
        .pipe(
            take(limitInt || data.length)
        )
        .subscribe(
            {
                next: comment => comments.push(comment),
                error: err => res.status(500).send(err),
                complete: () => res.send(comments),
            }
        )

    //'of' does not lead to name conflict
    /* for (let item of data) {
        let test = of(data);
        debugger
    } */

    //Using Lodash
    /* res.send(
        _.chain(data)
            .filter(comment => comment.name.match(text) || comment.email.match(text) || comment.body.match(text))
            .drop(skipInt || 0)
            .take(limitInt || data.length)
            .value()
    ); */
});

app.get('/api/comment/:id', (req, res) => res.send(_.find(data, { 'id': Number(req.params.id) })));

app.post('/api/comment', (req, res) => {
    let body;
    try {
        body = _.pick(req.body, ['postId', 'id', 'name', 'email', 'body']);
        data.push(body);

        jsonfile.writeFile(config.jsonPath, data, err => err ? res.status(500).send(err) : res.send(body));
    }
    catch (e) {
        res.status(500).send(e, { body });
    }
});

app.put('/api/comment/:id', (req, res) => {
    try {
        const body = _.pick(req.body, ['postId', 'name', 'email', 'body']);
        let comment = _.find(data, { 'id': req.params.id });

        comment = Object.assign({}, comment, body);
    }
    catch (e) {
        res.status(500).send(e, { body }, { comment });
    }
    res.send(comment);
});

app.use('/api', (req, res) => {
    res.send('Welcome to Dummy RESTful API\n' + req.originalUrl);
});

const port = 4000;

const server = app.listen(port, () => {
    console.log('Express is listening on port: ' + port);
});

server.timeout = 120000; //2 min