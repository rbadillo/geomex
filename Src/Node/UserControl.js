var express = require('express');
var Utilities= require('./UserControlUtilities');
var app = express();

app.configure(function(){
  app.set('port', 9000);
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(app.router);
  app.use(express.errorHandler());
});

app.get('/',Utilities.Test);
app.get('/GetUsersByLocationId/:LocationId',Utilities.GetUsersByLocationId);
app.post('/AddUserToLocation',Utilities.AddUserToLocation);
app.post('/RemoveUserFromLocation',Utilities.RemoveUserFromLocation);

app.listen(app.get('port'));
console.log("User Control Server - Listening Port: " +app.get('port'));