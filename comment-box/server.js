var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var COMMENTS_FILE = path.join(__dirname, 'comments.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


router.route('/comments')
    .get(function(req, res){
        fs.readFile(COMMENTS_FILE, function(err, comments){
            if(err) {
                console.error(err);
                process.exit(1);
            }
            res.json(JSON.parse(comments));
        });
    })

    .post(function(req, res){
        fs.readFile(COMMENTS_FILE, function(err, comments){
            if(err) {
                console.error(err);
                process.exit(1);
            }
            var comments = JSON.parse(comments);
            // NOTE: In a real implementation, we would likely rely on a database or
            // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
            // treat Date.now() as unique-enough for our purposes.
            var newComment = {
                id: Date.now(),
                author: req.body.author,
                text: req.body.text
            }
            comments.push(newComment);
            fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err){
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                res.json(comments);
            });
        });
    });

app.use('/api', router)



app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});