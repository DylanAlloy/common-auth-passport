const mongoose  = require("mongoose");
const Schema    = mongoose.Schema;
const moment    = require("moment");
const bcrypt    = require("bcryptjs");

// create schema & model
const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required!"]
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    }
});

const User = module.exports = mongoose.model("users", userSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.getUserByEmail = function(email, callback){
    var query = { email: email };
    User.findOne(query, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}