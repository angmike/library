var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GenreSchema = new Schema({
    name: {
        type: String, required: true, unique: true, min: 3, max: 100
    }
});

//virtalfor genre url
GenreSchema
.virtual('url')
.get(function(){
    return '/catalog/genre/' + this._id;
});

//export module
module.exports = mongoose.model('Genre', GenreSchema);
