var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
//var Cat = mongoose.model('Vote', { title: String });
var ObjectId = Schema.ObjectId;

var Vote = new Schema(
{
	id: ObjectId,
    type: String,
    created: Date,
    voter : { type: Schema.ObjectId, ref: 'User' },
    article : { type: Schema.ObjectId, ref: 'Vote' },



//t.integer :type_id*/
    //_user: { type: ObjectId, ref: 'Account' }
});

//module.exports = mongoose.model('Vote', { title: String,  });
module.exports = mongoose.model('Vote', Vote);