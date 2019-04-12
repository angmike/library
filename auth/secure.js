var User = require('../models/User');

module.exports = function(req, res, next){
    if(req.headers.authorization){
        var token = req.headers.authorization.split(' ')[1];
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var buff = new Buffer(base64, 'base64');
        var payloadinit = buff.toString('ascii');
        var payload = JSON.parse(payloadinit);
        console.log(payload);
        if(payload.id){
            User.findById(payload.id)
            .exec(function(err, usr){
                if(err){return next(err);}
                if(!usr){
                    res.json({msg: 'invalid token'});
                } else{
                next();
                }
            });
        } else {
            res.json({msg: 'invalid token; hoax'});
        }
    } else {
        var msg = 'the page you requested requires authorization, please login';
        if(req.header('content-type')=='application/json'){
            console.log(req.url);
            res.status(401).json({msg: msg});
        } else {
            res.render('login_form', {msg: msg, redir: req.url});
        }
    }
};
