var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var {body, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');
var async = require('async');

//define helper functions
val = function(arr, msg='^ is required'){
    var errors = [];
    for(var v of arr){
        errors.push(body(v).not().isEmpty().withMessage(msg.replace('^', v)).trim());
    }
    return errors;
};

exports.index = function(req, res) {
    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        if(err){return next(err);}
        if(req.header('Content-Type')=='application/json'){
            res.json({ title: 'Local Library Home', error: err, data: results });
        } else {
            res.render('index', { title: 'Local Library Home', error: err, data: results });
        }
    });
};

// Display list of all books.
exports.book_list = function(req, res, next) {

    Book.find({}, 'title author')
      .populate('author')
      .exec(function (err, list_books) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('book_list', { title: 'Book List', book_list: list_books });
      });

  };

// Display detail page for a specific book.
exports.book_detail = function(req, res, next){
    async.parallel({
        detail: function(callback){
            Book.findById(req.params.id)
            .populate('author genre')
            .exec(callback);
        },
        available: function(callback){
            BookInstance.find({'book': req.params.id, 'status': 'Available'})
            .exec(callback);
        },
        maintenance: function(callback){
            BookInstance.find({'book': req.params.id, 'status': 'Maintenance'})
            .exec(callback);
        },
        count: function(callback){
            BookInstance.countDocuments({'book': req.params.id}).exec(callback);
        }
    }, function(err, result){
        if(err){return next(err);}
        result.msg = req.query.msg;
        result.success = req.query.success;
        console.log(result.detail.url);
        res.render('book_detail', {title: result.detail.title, result: result});
    }
    );
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    async.parallel({
        authors: function(callback){
            Author.find().exec(callback);
        },
        genres: function(callback){
            Genre.find().exec(callback);
        }
    }, function(err, result){
        var data = {author: result.authors, genre: result.genres};
        if(req.query.return)
        Object.assign(data, req.query);
        console.log('get data=====', data);
        res.render('book_form', {title: 'Create a Book', book: data});
    });
};

// Handle book create on POST.
exports.book_create_post = [
    val(['title', 'author', 'genre', 'summary']),

    body('isbn', 'isbn format wrong').isNumeric().trim(),

    sanitizeBody().trim().escape(),

    function(req, res, next){
        const errors = validationResult(req);
        console.log('post data====', req.body);
        if(!errors.isEmpty()){
            req.body.errors = errors.array();
            res.render('book_form', {title: 'Book Create Data Error', book: req.body});
        } else {
            async.parallel({
                author: function(callback){
                    Author.findOne({'first_name': req.body.author.split(' ')[1].norm(), 'family_name': req.body.author.split(' ')[0].norm()})
                    .exec(callback);
                },
                genre: function(callback){
                    Genre.findOne({'name': req.body.genre.norm()})
                    .populate()
                    .exec(callback);
                }
            },
            function(err, result){
                var queryString = Object.keys(req.body).map(key => key + '=' + req.body[key]).join('&');
                if(err){return next(err);}
                else if(!result.author){
                    res.redirect(`../author/create?return=../book/create&msg=Create author to proceed&data=true&${queryString}`);
                } else if(!result.genre){
                    res.redirect(`../genre/create?return=../book/create&msg=Genre ${req.body.genre} not in library, create genre to continue&data=true&${queryString}`);
                } else {
                    var book = new Book({title: req.body.title, author: result.author.id, genre: result.genre.id, isbn: req.body.isbn, summary: req.body.summary});
                    // Book.findOne({'title': book.title, 'author': book.author, 'isbn': book.isbn})
                    // .exec(function(error, found){
                    //     if(err){return next(err);}
                    //     if(found){
                    //         res.redirect(found.url + `?msg=book ${found.title} by ${found.author.name} exists!&success=`);
                    //     } else {
                    //         book.save(function(err){
                    //             if(err){return next(err);}
                    //             res.redirect(book.url + `?msg=book ${book.title} by ${book.author.name} created&success=true`);
                    //         });
                    //     }
                    // });
                    Book.findOne({'isbn': book.isbn})
                    .populate('author')
                    .exec(function(err, found){
                        if(err){return next(err);}
                        if(found){
                            res.redirect(found.url + `?msg=book "${found.title}" by ${found.author.name} exists! if details don't match, cross-check isbn&success=`);
                        } else {
                            book.save(function(err){
                                if(err){return next(err);}
                                var data = req.query;
                                Object.assign(data, req.body);
                                delete Object.assign(data, {selected: data.title})['title'];
                                if(data.return){
                                    data.msg = `book ${book.title} by ${req.body.author} created, submit to complete`
                                    var queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
                                    res.redirect(req.query.return + '?' + queryString);
                                } else {
                                    res.redirect(book.url + `?msg=book ${book.title} by ${req.body.author} created&success=true`);
                                }
                            });
                        }
                    });
                    }
                }
            );
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
     // Get book, authors and genres for form.
     async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('book_form', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book });
        });

};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];
