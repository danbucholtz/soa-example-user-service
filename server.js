var mongoose = require('mongoose');
var service = require("soa-example-core-service");
var config = require("soa-example-service-config").config();

var userController = require('./controllers/UserController');

mongoose.connect(servicesConfig.mongoUri);

var app = service.createServer(config.authenticationServicePort);

app.post('/register', userController.createUser);
app.get('/users', userController.getUsers);
app.get('/users/:id', userController.getUserByEmailAddressOrId);