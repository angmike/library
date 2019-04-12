var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
var {body, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');
global.document = Genre;


//helper function to capitalize strings
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

//function to sentence case strings
String.prototype.norm = function(){
    return this.trim().split(' ').map(i => i.capitalize()).join(' ');
};

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre.find().exec(function(err, list_genres){
        if (err){return next(err);}
        res.render('genre_list', {title: 'Book Genres', genre_list: list_genres});
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
          Book.find({ 'genre': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        var msg = req.query.msg;
        if(msg){
            results.msg = msg;
            results.success = req.query.success;
        }
        console.log(req.query.msg);
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books, msg: results.msg, success: results.success} );
    });

};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre', genre: req.query});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    //validate name required and min length
    body('name')
    .isLength({min: 1})
    .withMessage('Genre name required')
    .isLength({min:3})
    .withMessage('name must be atleast of length 3')
    .trim(),
    //sanitize name
    sanitizeBody('name').trim().escape(),
    //post validation processing
    (req, res, next) => {
        //extract validation errors
        const errors = validationResult(req);
        //create genre object with validated and sanitized data
        var genre = new Genre({name: req.body.name.norm()});
        if(!errors.isEmpty()){
            //re-render form with sanitized values/errors
            res.render('genre_form', {title: 'Create Genre Error', genre: genre, errors: errors.array()});
            return;
        }
        else {
            //data is valid
            //check if genre already exists
            Genre.findOne({'name': req.body.name})
            .exec(function(err, found_genre){
                if(err){return next(err);}
                if(found_genre){
                    //genre exists, redirect to its detail page
                    res.redirect(found_genre.url + '?msg=Genre Exists !&success=');
                }
                else {
                    genre.save(function(err){
                        if(err){return next(err);}
                        //genre saved, redirect to detail page
                        if(req.query.return){
                            var data = req.query;
                            data.msg = `genre ${genre.name} created, ensure all fields are complete and submit to create book`
                            var queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
                            res.redirect(req.query.return + '?' + queryString);
                        } else {
                            res.redirect(genre.url + '?msg=Genre Created !&success=true');
                        }
                    });
                }
            });
        }
    }

];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
