var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	emailAddress: String,
    password : String,
    salt: String,
    accessToken: String,
	updated: { type: Date, default: Date.now },
	created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);