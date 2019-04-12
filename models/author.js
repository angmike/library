var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var moment = require('moment');

var AuthorSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

//define unique index to make name unique
// AuthorSchema.index({ first_name: 1, family_name: 1}, { unique: true });

//Virtual for author's fullname
AuthorSchema
.virtual('name')
.get(function(){
    return this.family_name + ' ' + this.first_name;
});

//format birth and death dates
AuthorSchema
.virtual('birth')
.get(function(){
    return moment(this.date_of_birth).format('MMMM DD, YYYY');
});

AuthorSchema
.virtual('death')
.get(function(){
    return moment(this.date_of_death).format('MMMM DD, YYYY');
});

//virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function(){
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

//virtual for author's url
AuthorSchema
.virtual('url')
.get(function(){
    return '/catalog/author/' + this._id;
});



//export model
module.exports = mongoose.model('Author', AuthorSchema);
