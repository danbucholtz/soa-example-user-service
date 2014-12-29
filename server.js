var mongoose = require('mongoose');
var service = require("soa-example-core-service");
var config = require("soa-example-service-config").config();

var userController = require('./controllers/UserController');

mongoose.connect(config.mongoUri);

var app = service.createApiServer(config.userServicePort);

app.post('/register', userController.createUser);
app.get('/users', service.ensureAuthenticated, userController.getUsers);
app.get('/users/:id', userController.getUserByEmailAddressOrId);
app.get("/users/accessToken/:accessToken", userController.getUserByAccessToken);