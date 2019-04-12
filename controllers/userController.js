var User = require('../models/User');
var book = require('../models/book');
var genre = require('../models/genre');
var async = require('async');
var {body, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');



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

//get a list of all users
exports.user_list = function(req, res, next){
    User.find().exec(function(err, users){
        if(err){return next(err);}
        var resp = {title: 'All Users', users: users};
        if(req.header('content-type')=='application/json'){
            res.json(resp);
        } else {
            res.render('user_list', resp);
        }
    });
};

//display signup form
exports.user_create_get = function(req, res){
    var user = {};
    res.render('signup_form', {title: 'user signup', user:user});
};

//handle post request for signup
exports.user_create_post = [
    val(['first_name', 'family_name', 'email', 'password']),
    body('email', 'invalid email').isEmail(),
    // body('username', 'invalid username').optional().isAlphanumeric,
    // body('phone', 'invalid telephone number').isMobilePhone(),

    function(req, res, next){
        var errors = validationResult(req);
        if(!errors.isEmpty()){
            var errorArray = errors.array().map(e=>e.msg);
            if(req.header('content-type')=='application/json'){
                res.json({title: 'Signup errors', errors: errorArray});
            } else {
                res.render('signup_form', {title: 'Errors in data', errors: errorArray, user: req.body});
            }
        } else {
            user = new User(req.body);
            User.find({'email': user.email})
            .exec(function(err, result){
                if(err){return next(err);}
                else if(result.length>0){
                    var resp = {name: result[0].name, id: result[0]._id, email: result[0].email};
                    var msg = `email ${result[0].email} exists, please login`;
                    var response = {title: 'User Signup', msg:msg, user:resp};
                    if(req.header('content-type')=='application/json'){
                        res.json(response);
                    } else {
                        res.render('signup_form', response);
                    }

                } else {
                    user.setPassword(req.body.password);
                    user.save(function(err){
                        if(err){
                            res.statusCode = 500;
                            return next(err);
                        }
                        res.statusCode = 201;
                        var resp = {title:'New User', msg: `welcome ${user.name} please login`, user:user.toAuthJson()};
                        if(req.header('content-type')=='application/json'){
                            res.json(resp);
                        } else {
                            res.render('login_form', resp);
                        }
                });
            }
        });
    }
}];

//display login form
exports.user_login_get = function(req, res){
    res.render('login_form', {title: 'Login'});
};

//handle login post request
exports.user_login_post = function(req, res, next){
    var user = req.body;
    console.log('***', user);
    User.findOne({email: user.email})
    .exec(function(err, result){
        if(err){return next(err);}
        console.log(result);
        if(!result){
            res.statusCode = 400;
            var resp = {title: 'Login error', msg:'wrong email'};
            if(req.header('content-type')=='application/json'){
                res.json(resp);
            } else {
                res.render('login_form', resp);
            }
        }
        else if(result.validatePassword(user.password)){
            var jwt = result.generateToken();
            // res.cookie('Authorization', jwt);
            var msg = `dear ${result.name}, you are logged in`;
            if(req.header('content-type')=='application/json'){
                res.json({msg: msg, user: result.toAuthJson()});
            } else {
                res.cookie('Authorization', 'Bearer'+ ' ' + jwt);
                if(req.body.redir){
                    res.redirect(`/catalog${req.body.redir}`);
                } else {
                    res.redirect(result.url + `?msg=${msg}&token=${result.toAuthJson().token}`);
                }
            }
        } else {
            res.statusCode = 401;
            var resp1 = {title: 'Login error', msg:'wrong password', user:user};
            if(req.header('content-type')=='application/json'){
                res.json(resp1);
            }
            res.render('login_form', resp1);
        }
    });
};

//display logout form
exports.user_logout_get = function(req, res){
    res.render('logout_form', {title: 'Logout'});
};

//hanle logout post request
exports.user_logout_post = function(req, res){
    res.redirect('/users/login?msg=logout successful')
};

//display user form for update
exports.user_update_get = function(req, res){
    res.send('edit not implemented');
};

//handle user update post request
exports.user_update_post = function(req, res){
    res.send('none');
};

//display delete user form
exports.user_delete_get = function(req, res){
    res.send('delete not implemented');
};

//handle user deletion post request
exports.user_delete_post = function(req, res){
    res.send('none');
};

//display a particular user's profile page
exports.user_details = function(req, res, next){
    // req.headers.Authorization = req.cookies.Authorization;
    User.findById(req.params.id)
    .exec(function(err, user){
        if(err){return next(err);}
        user.toAuthJson();
        user.books = [];
        console.log('///-----///', req.headers);
        res.render('user_profile', {title: user.name, msg:req.query.msg, user:user, token:req.query.token});
    });
};
