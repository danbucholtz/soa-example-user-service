var uuid = require('node-uuid');
var Q = require("q");
var User = require("../models/User");

var utils = require("soa-example-core-utils");

var config = require("soa-example-service-config").config();
var log = require('soa-example-logging-service-api');

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
	log.debug(req.user.accessToken, "getUsers: User [" + req.user.emailAddress + "] is requesting all Users ...");
	getAllUsersInternal().then(function(users){
		log.debug(req.user.accessToken, "getUsers: User [" + req.user.emailAddress + "] is requesting all Users ... DONE");
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
	log.debug(config.systemAccessToken, "getUserByEmailAddressInternal: Getting User By Email Address [" + emailAddress + "] ...");
	User.findOne({emailAddress:emailAddress}, function(err, user){
		log.debug(config.systemAccessToken, "getUserByEmailAddressInternal: Getting User By Email Address [" + emailAddress + "] ... DONE");
		deferred.resolve(user);
	});
	return deferred.promise;
};

var getUserByAccessTokenInternal = function(token){
	var deferred = Q.defer();
	log.debug(config.systemAccessToken, "getUserByAccessTokenInternal: Getting User By Token [" + token + "] ...");
	User.findOne({accessToken:token}, function(err, user){
		log.debug(config.systemAccessToken, "getUserByAccessTokenInternal: Getting User By Token [" + token + "] ... DONE");
		deferred.resolve(user);
	});
	return deferred.promise;
};

var getUserByIdInternal = function(id){
	var deferred = Q.defer();
	log.debug(config.systemAccessToken, "getUserByIdInternal: Getting User By ID [" + id + "] ...");
	User.findOne({_id:id}, function(err, user){
		log.debug(config.systemAccessToken, "getUserByIdInternal: Getting User By ID [" + id + "] ... DONE");
		deferred.resolve(user);
	});
	return deferred.promise;
};

var createUserInternal = function(emailAddress, password){
	var deferred = Q.defer();

	log.debug(config.systemAccessToken, "createUserInternal: Creating User [" + emailAddress + "] ...");
	
	var user = new User();
    user.created = new Date();
    user.emailAddress = emailAddress;
    user.salt = uuid.v4();
    user.password = utils.hashPassword(password, user.salt);

    var token = uuid.v4() + "-" + uuid.v4() + "-" + uuid.v4() + "-" + uuid.v4() + "-" + uuid.v4();

    user.accessToken = token;

    user.save(function(err, userEntity){
    	log.debug(config.systemAccessToken, "createUserInternal: Creating User [" + emailAddress + "] ... DONE");
    	deferred.resolve(userEntity);
    });

    return deferred.promise;
};

var getAllUsersInternal = function(){
	var deferred = Q.defer();

	User.find({emailAddress: { $ne : config.systemAdminUsername} }, function(err, entities){
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