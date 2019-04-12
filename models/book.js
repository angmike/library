var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookSchema = new Schema({
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: {type: String},
    isbn: {type: String, required: true, unique: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
});

//virtal for url
BookSchema
.virtual('url')
.get(function(){
    return '/catalog/book/' + this._id;
});

//export module
module.exports = mongoose.model('Book', BookSchema);
