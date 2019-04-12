var author = require('../models/author');
var book = require('../models/book');
var genre = require('../models/genre');
var async = require('async');
var {body, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');

//display author list
exports.author_list = function(req, res, next){
    console.log('////', req.headers);
    author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors){
        if(err) {return next(err);}
        res.render('author_list', {title: 'All Authors', author_list: list_authors});
    });
};

//display author details
exports.author_details = function(req, res){
    async.parallel({
        author: function(callback){
            author.findById(req.params.id)
            .exec(callback);
        },
        books: function(callback){
            book.find({'author': req.params.id})
            .populate('genre')
            .exec(callback);
        },
        count: function(callback){
            book.countDocuments({'author': req.params.id}).exec(callback);
        }
    }, function(err, result){
        if(err){return next(err);}
        //check for message on redirect
        if(req.query.msg){
            result.msg = req.query.msg;
            result.success = req.query.success;
        }
        res.render('author_details', {title: result.author.name, result: result});
    });
};

//display author create form on get
exports.author_create_get = function(req, res){
    var data = req.query;
    res.render('author_form', {title: 'Create Author', result: data});
};

val = function(arr, msg='^ is required'){
    var errors = [];
    for(var v of arr){
        errors.push(body(v).not().isEmpty().withMessage(msg.replace('^', v))
        .isAlphanumeric().withMessage(`${v} has invalid characters for a name`));
    }
    return errors;
};
//handle author create on post
exports.author_create_post = [
    // body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    // body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),
    val(['first_name', 'family_name']),

    sanitizeBody()
    .trim()
    .escape(),

    function(req, res, next){
        const errors = validationResult(req);

        var auth = new author({first_name: req.body.first_name.norm(), family_name: req.body.family_name.norm(), date_of_birth: req.body.born, date_of_death: req.body.died});

        if(!errors.isEmpty()){
            var data = req.query;
            Object.assign(data, req.body);
            res.render('author_form', {title: 'Create Author Errors', result: data, errors: errors.array()});
            return;
        }
        else {
                author.findOne({'first_name': auth.first_name, 'family_name': auth.family_name})
                .exec(function(err, found){
                    if(err){return next(err);}
                    if(found){
                        res.redirect(found.url + `?msg=Author ${auth.name} exists!&success=`);
                    }
                    else {
                        auth.save(function(err){
                            if(err){return next(err);}
                            if(req.query.return){
                                var data = req.query;
                                data.msg = `Author ${auth.name} created, procced`
                                data.author = auth.first_name + ' ' + auth.family_name;
                                var queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
                                res.redirect(req.query.return + `?success=true&data=true&` + queryString);
                            } else {
                                res.redirect(auth.url + `?msg=Author ${auth.name} created&success=true`);
                            }
                        });
                    }
            });
        }
    }

];

//display author delete form on get
exports.author_delete_get = function(req, res){
    res.send('NOT IMPLEMENTED: Author delete GET');
};

//handle author delete on post
exports.author_delete_post = function(req, res){
    res.send('NOT IMPLEMENTED: Author delete POST');
};

//display author update form on get
exports.author_update_get = function(req, res){
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
