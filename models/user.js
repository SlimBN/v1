// app/models/user.js
// load the things we need
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

//var Article = require('./article');

// define the schema for our user model
var userSchema = mongoose.Schema({

    blogname         : String,
    blogslug         : String,
    blogcover        : String,

    number_of_articles   :  { type: Number, default: 0 },
    number_of_views      :  { type: Number, default: 0 },
    number_of_reads      :  { type: Number, default: 0 },
    number_of_lectures   :  { type: Number, default: 0 },
    
    articles : [{ type: Schema.ObjectId, ref: 'Article' }],
    followees : [{ type: Schema.ObjectId, ref: 'User' }],
    followers : [{ type: Schema.ObjectId, ref: 'User' }],
    followees_count  :  { type: Number, default: 0 },
    followers_count  :  { type: Number, default: 0 },
    // articles : [Article],

    fb_page:  { type: String, default: "" },
    tw_account:  { type: String, default: "" },
    g_page:  { type: String, default: "" },
    p_account:  { type: String, default: "" },
    in_account:  { type: String, default: "" },


    local            : {
        email        : String,
        username	 : String,
        avatar       : String,
        first_name 	 : String,
        last_name	 : String,
        full_name	 : String,
        about		 : String,
        registered_at: Date,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);