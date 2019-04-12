var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var moment = require('moment');

var BookInstanceSchema = new Schema({
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    imprint: {type: String, required: true, unique: true},
    status: {type: String, enum: [
        'Available', 'Maintenance', 'Loaned', 'Reserved'],
        required: true, default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
});

//virtal for url
BookInstanceSchema
.virtual('url')
.get(function(){
    return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return moment(this.due_back).format('MMMM DD, YYYY');
});

BookInstanceSchema
.virtual('diff')
.get(function () {
  var secs = 24*60*60*1000;
  return Math.ceil((Date.now() - this.due_back)/secs);
});

//export module
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
