var mongoose = require('mongoose');
const BaseSchema = require('./BaseSchema');

var UserSchema = new BaseSchema({
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
