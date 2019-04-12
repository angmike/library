var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var {body, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');
var moment = require('moment');
var alert = require('js-alert');


//helpers
val = function(arr, msg='^ is required'){
    var errors = [];
    for(var v of arr){
        errors.push(body(v).not().isEmpty().withMessage(msg.replace('^', v)).trim());
    }
    return errors;
};

function queryString(obj){
    return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
      .populate('book')
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render
        result = {bookinstance_list: list_bookinstances};
        Object.assign(result, req.query);
        console.log(result);
        if(req.header('Content-Type')=='application/json'){
            res.json({ title: 'Book Instance List',  result: result});
        } else {
            res.render('bookinstance_list', { title: 'Book Instance List',  result: result});
        }
      });
  };

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .populate('genre')
    .exec(function(err, result){
        if(err){return next(err);}
        Object.assign(result, req.query);
        var msg = req.query.msg;
        if(req.header('Content-Type')=='application/json'){
            res.json({title: 'ID ' + req.params.id, instance: result});
        } else {
            res.render('bookinstance_detail', {title: 'ID ' + req.params.id, msg:msg, instance: result});
        }
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res) {
    Book.find().exec(function(err, book_list){
        if(err){return next(err);}
        var data = {titles: book_list};
        Object.assign(data, req.query);
        res.render('bookinstance_form', {title: 'Create Book Copy', book: data});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    val(['title', 'imprint', 'status']),
    body('due_back').optional().toDate(),
    body('status', 'invalid status').isIn(['Available', 'Loaned', 'Maintenance', 'Reserved']),
    sanitizeBody().trim().escape(),

    function(req, res, next){
        console.log('--------', req.headers);
        var errors = validationResult(req);
        var data = req.body;
        if(!errors.isEmpty()){
            // delete Object.assign(data, {selected: data.title}).title;
            errorString = errors.array().map(v=> 'errors[]='+v.msg).join('&');
            // res.render('bookinstance_form', {title: 'Create Book Copy error', book: data});
            res.statusCode = 400;
            if(req.header('Content-Type')=='application/json'){
                res.json({msg: 'errors in values', errors: errors.array().map(e=>e.msg)});
            } else {
                res.redirect('../bookinstance/create?' + queryString(data) + '&' + errorString);
            }
        } else {
            Book.findOne({'title': data.title})
            .exec(function(err, found){
                if(err){return next(err);}
                if(!found){
                    data.msg = `book '${data.title}' not in library, create it to continue`;
                    data.return = '../bookinstance/create';
                    res.statusCode=404;
                    if(req.header('Content-Type')=='application/json'){
                        res.json({msg: data.msg});
                    } else {
                        res.redirect('../book/create?'+ queryString(data));
                    }
                } else {
                    BookInstance.findOne({'imprint': data.imprint})
                    .exec(function(err, copy){
                        if(err){return next(err);}
                        if(copy){
                            data.msg = `A copy with imprint ${data.imprint} already in collection, please change imprint`;
                            if(req.header('Content-Type')=='application/json'){
                                res.json({Id: copy._id, msg: data.msg});
                            } else {
                                res.redirect(copy.url + '?' + queryString(data));
                            }
                        } else {
                            var inst = new BookInstance({book: found.id, imprint: data.imprint, status: data.status.norm(), due_back: data.due_back || Date.now()});
                            inst.save(function(err){
                                if(err){return next(err);}
                                res.statusCode=201;
                                var msg = `Copy of ${data.title} with imprint ${inst.imprint} added to library collection`
                                if(req.header('Content-Type')=='application/json'){
                                    res.json({Id: inst._id, msg:msg, copy: inst});
                                } else {
                                    res.redirect(inst.url + `?msg=${encodeURIComponent(msg)}`);
                                }
                                // res.mailer.send('email', {
                                //     to: 'anguamike@yahoo.com, mikeanguandia@gmail.com',
                                //     subject: 'new book',
                                //     body: msg,
                                //     }, function (err) {
                                //     if (err) {
                                //         // handle error
                                //         res.send('There was an error sending the email '+err); //this will print error if email is not sent
                                //         return;
                                //     }
                                // });
                            });
                        }
                    });
                }
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    console.log('aaaa', req.headers);
    var ids = req.params.id.split('-');
    var count = ids.length;
    BookInstance.find({_id: {$in: ids}})
    .populate('book')
    .exec(function(err, result){
        if(err){return next(err);}
        res.render('bookinstance_delete_form', {title: 'Delete Book Copy', count: count, instance: result});
    });
};

// exports.bookinstances_delete_get = function(req, res, next) {
//     BookInstance.findById(req.params.id)
//     .populate('book')
//     .exec(function(err, result){
//         if(err){return next(err);}
//         res.render('bookinstance_delete_form', {title: 'Delete Book Copy', instance: result});
//     });
// };

// Handle BookInstance delete on POST.
// exports.bookinstance_delete_post = function(req, res, next) {
//     BookInstance.findById(req.params.id)
//     .populate('book')
//     .exec(function(err, result){
//         if(err){return next(err);}
//         var title = result.book.title;
//         result.delete(function(err){
//             if(err){return next(err);}
//             var msg = `copy of ${title} deleted`
//             if(req.header('Content-Type')=='application/json'){
//                 res.json({Id: result._id, msg: msg});
//             } else {
//                 res.redirect(`/catalog/bookinstances?msg=${encodeURIComponent(msg)}`);
//             }
//         });
//     });
// };

exports.bookinstance_delete_post = function(req, res, next) {
    var ids = req.params.id.split('-');
    var flag = true;
    var msg;
    BookInstance.find({_id: {$in: ids}})
    .populate('book')
    .exec(function(err, results){
        if(err){return next(err);}
        var titles = results.map(i=>i.book.title + '-' + i.imprint).join(', ');
        for(var i=0; i<results.length; i++){
            results[i].remove(function(err){
                if(err){
                    flag = false;
                    return next(err);
                }
            });
        }
        if(flag==true){
            msg = `The following book copies have been deleted: ${titles}`;
            if(req.header('Content-Type')=='application/json'){
                res.json({msg: msg});
            } else {
                res.redirect(`/catalog/bookinstances?msg=${encodeURIComponent(msg)}`);
            }
        }
    });
};


// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.render('bookinstance_form', {title: 'Update Book Copy Particulars', book:req.query});
};

// Handle bookinstance update on POST.
// exports.bookinstance_update_post = [
//     //validate inputs as required
//     val(['imprint', 'status']),
//     body('due_back').optional().toDate(),
//     sanitizeBody().trim().escape(),
//     //main function
//     function(req, res, next) {
//         var data=req.body;
//         data._id = req.params.id;
//         data.due_back = moment(data.due_back).format('MMMM DD, YYYY');
//         var errors = validationResult(req);
//         if(!errors.isEmpty()){
//             data.errors = errors.array();
//             data.msg = 'errors in input';
//             var title = 'Update Copy Errors';
//             res.statusCode=400;
//             if(req.header('Content-Type')=='application/json'){
//                 res.json({title: title, msg: msg, data: data});
//             }else{
//                 res.render('bookinstance_form', {title: title, book:data});
//             }
//         }else{
//             copy = new BookInstance(data);
//             BookInstance.findByIdAndUpdate(req.params.id, copy, {}).
//             populate('book').
//             exec(function(err, result){
//                 if(err){return next(err);}
//                 var msg = `book ${result.book.title}\: ${result.imprint} updated`;
//                 if(req.header('Content-Type')=='application/json'){
//                     res.json({Id: result._id, msg: msg, copy: result});
//                 } else {
//                     res.redirect(result.url + `?msg=${encodeURIComponent(msg)}`);
//                 }
//             });
//         }
//     }];

exports.bookinstance_update_post = [
    //validate inputs as required
    val(['status']),
    // body('due_back').optional().toDate(),
    sanitizeBody().trim().escape(),
    //main function
    function(req, res, next) {
        var data=req.body;
        var ids = req.params.id.split('-');
        data.due_back = data.due_back==''?'': moment(data.due_back).format('MMMM DD, YYYY');
        Object.keys(data).forEach(key => (data[key]=='') && delete data[key]);
        var fields = Object.keys(data).join(', ');
        var news = Object.values(data).join(', ');
        // data.id = ids;
        var errors = validationResult(req);
        if(!errors.isEmpty()){
            data.errors = errors.array();
            data.msg = 'errors in input';
            var title = 'Update Copy Errors';
            res.statusCode=400;
            if(req.header('Content-Type')=='application/json'){
                res.json({title: title, msg: msg, data: data});
            }else{
                res.render('bookinstance_form', {title: title, book:data});
            }
        }else{
            BookInstance.find({_id: {$in: ids}}).
            populate('book').
            exec(function(err, result){
                if(err){return next(err);}
                var msg;
                var url;
                var id;
                // var msg = `book ${result.book.title}\: ${result.imprint} updated`;
                // var titles = result.map(i=>i.book.title + '-' + i.imprint).join(', ');
                for(var i=0; i<result.length; i++){
                    // copy = new BookInstance(data);
                    result[i].update({$set: data}, {}, function(err){
                        if(err){return next(err);}
                    });
                }
                if(result.length==1){
                    msg = `book ${result[0].book.title}\: ${result[0].imprint} updated`;
                    url = result[0].url;
                    id = result[0]._id;
                } else {
                    msg = `${result.length} books' ${fields} have been updated to ${news}`;
                    url = '/catalog/bookinstances';
                    id = result.map(i=>i._id);
                }
                if(req.header('Content-Type')=='application/json'){
                    res.json({Id: id, msg: msg, copy: result[0]});
                } else {
                    res.redirect(url + `?msg=${encodeURIComponent(msg)}&id=${id}`);
                }
            });
        }
    }];
