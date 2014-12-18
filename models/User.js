var mongoose = require('mongoose');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
	emailAddress: String,
    password : String,
    salt: String,
	updated: { type: Date, default: Date.now },
	created: { type: Date, default: Date.now }
});

UserSchema.statics.hashPassword = function(password, salt) {
    return crypto.createHash("sha256").update(password).update(salt).digest("hex");
}

module.exports = mongoose.model('User', UserSchema);