var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
	'username': {
		type: String,
		required: true,
		unique:true
	},
	'password': {
		type: String,
		required: true
	},
	'email' : String,
	'name' : String
});

module.exports = mongoose.model('User', UserSchema);
