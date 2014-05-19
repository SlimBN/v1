// app/models/config.js
// load the things we need
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

//var Article = require('./article');

// define the schema for our config model
var configSchema = mongoose.Schema({


    number_of_articles   :  { type: Number, default: null },
    number_of_visits	 :  { type: Number, default: null },
    number_of_reads      :  { type: Number, default: null },
    number_of_logged_visits   :  { type: Number, default: null },
    number_of_disc_visits   :  { type: Number, default: null },
    number_of_users   :  { type: Number, default: null },

    admins : [{ type: Schema.ObjectId, ref: 'User' }],
    moderators : [{ type: Schema.ObjectId, ref: 'User' }],
    // articles : [Article],

    fb_page:  { type: String, default: "" },
    tw_account:  { type: String, default: "" },
    g_page:  { type: String, default: "" },
    p_account:  { type: String, default: "" },
    in_account:  { type: String, default: "" },

});

// create the model for configs and expose it to our app
module.exports = mongoose.model('Config', configSchema);