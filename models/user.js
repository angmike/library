var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
var validator = require('mongoose-unique-validator');
var encrypt = require('crypto');
var token = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    user_name: {type: String},
    date_of_birth: {type: Date},
    phone: {type: String},
    email: {type: String, required: true},
    hash: String,
    salt: String
}, {timestamps: true}
);

//define unique index to make name unique
// UserSchema.index({ first_name: 1, family_name: 1}, { unique: true });

//Virtual for User's fullname
UserSchema
.virtual('name')
.get(function(){
    return this.family_name + ' ' + this.first_name;
});

//format birth and death dates
UserSchema
.virtual('birth')
.get(function(){
    return moment(this.date_of_birth).format('MMMM DD, YYYY');
});

//virtual for User's url
UserSchema
.virtual('url')
.get(function(){
    return '/users/' + this._id;
});

//hash password
UserSchema.methods.setPassword = function(password){
    this.salt = encrypt.randomBytes(16).toString('hex');
    this.hash = encrypt.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

//validate password
UserSchema.methods.validatePassword = function(password){
    var hash = encrypt.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash == hash;
};

//generate token
UserSchema.methods.generateToken = function(){
    var now = new Date();
    var exp = new Date(now);
    exp.setMinutes(now.getMinutes() + 10);
    return token.sign({
        id: this._id,
        name: this.name,
        exp: parseInt(exp.getTime()/1000),
    }, secret);
};

//

//return json representation of user
UserSchema.methods.toAuthJson = function(){
    return {
        name: this.name,
        email: this.email,
        token: this.generateToken(),
        phone: this.phone,
    };
};

//add
// UserSchema.plugin(validator, {message: "is already taken."});

//export model
module.exports = mongoose.model('User', UserSchema);
