var uuid = require('node-uuid');
var Q = require("q");
var User = require("../models/User");

var utils = require("soa-example-core-utils");

var createUser = function(req, res){
	var emailAddress = req.body.emailAddress;
	var password = req.body.password;

	if ( !emailAddress || !password ){
		res.statusCode = 500;
		res.send({success:false, errorMessage:"Username and Password are both required"});
		return;
	}

	getUserByEmailAddressInternal(emailAddress).then(function(user){
		if ( user ){
			// user already exists
			res.statusCode = 500;
			res.send({success:false, errorMessage:"User w/ email address already exists"});
		}
		else{
			createUserInternal(emailAddress, password).then(function(user){
				if ( !user ){
					res.statusCode = 500;
					res.send({success:false, errorMessage:"Failed to create user"});
				}

				res.send({success:true});
			});
		}
	});
};

var getUsers = function(req, res){
	getAllUsersInternal().then(function(users){
		res.send(users);
	});
}

var getUserByEmailAddressOrId = function(req, res){
	var id = req.params.id;
	if ( !id ){
		res.statusCode = 500;
		res.send({success:false, errorMessage:"Email Address or ID required"});
		return;
	}
	getUserByIdOrEmailInternal(id).then(function(user){
		res.send(user);
	});
};

var getUserByAccessToken = function(req, res){
	var token = req.params.accessToken;
	getUserByAccessTokenInternal(token).then(function(user){
		res.send(user);
	});
};

/* Private Methods */

var getUserByIdOrEmailInternal = function(toFind){
	var deferred = Q.defer();
	getUserByIdInternal(toFind).then(function(user){
		if ( !user ){
			getUserByEmailAddressInternal(toFind).then(function(user){
				deferred.resolve(user);
			});
		}
		else{
			deferred.resolve(user);
		}
	});
	return deferred.promise;
};

var getUserByEmailAddressInternal = function(emailAddress){
	var deferred = Q.defer();
	User.findOne({emailAddress:emailAddress}, function(err, user){
		deferred.resolve(user);
	});
	return deferred.promise;
};

var getUserByAccessTokenInternal = function(token){
	var deferred = Q.defer();
	User.findOne({accessToken:token}, function(err, user){
		deferred.resolve(user);
	});
	return deferred.promise;
};

var getUserByIdInternal = function(id){
	var deferred = Q.defer();
	User.findOne({_id:id}, function(err, user){
		deferred.resolve(user);
	});
	return deferred.promise;
};

var createUserInternal = function(emailAddress, password){
	var deferred = Q.defer();
	
	var user = new User();
    user.created = new Date();
    user.emailAddress = emailAddress;
    user.salt = uuid.v4();
    user.password = utils.hashPassword(password, user.salt);

    var token = uuid.v4();

    //var encryptedToken = utils.encryptString(token);

    user.accessToken = token;

    user.save(function(err, userEntity){
    	deferred.resolve(userEntity);
    });

    return deferred.promise;
};

var getAllUsersInternal = function(){
	var deferred = Q.defer();

	User.find(function(err, entities){
		if ( err ){
			deferred.reject(err);
		}
		else{
			deferred.resolve(entities);
		}
	});

	return deferred.promise;
};

module.exports = {
	createUser: createUser,
	getUsers: getUsers,
	getUserByEmailAddressOrId: getUserByEmailAddressOrId,
	getUserByAccessToken: getUserByAccessToken
};