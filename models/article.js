var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
//var Cat = mongoose.model('Article', { title: String });
var ObjectId = Schema.ObjectId;

var Article = new Schema(
{
	id: ObjectId,
    title: String,
    abstract: String,
    content: String,
    slug: String,
    shot: String,
    overlay: String,
    sum_of_views: Number,
    sum_of_comments: Number,
    created: Date,
    updated: Date,
    author : { type: Schema.ObjectId, ref: 'User' },



//t.integer :type_id*/
    //_user: { type: ObjectId, ref: 'Account' }
});

//module.exports = mongoose.model('Article', { title: String,  });
module.exports = mongoose.model('Article', Article);