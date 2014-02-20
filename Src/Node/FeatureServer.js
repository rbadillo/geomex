var express = require('express');
var Utilities= require('./FeatureServerUtilities');
var app = express();

app.configure(function(){
  app.set('port', 4000);
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(app.router);
  app.use(express.errorHandler());
});

express.logger.token('date', function(){
  return new Date();
});

app.get('/',Utilities.Test);
app.get('/:UserId/GetAllActiveClients',Utilities.GetAllActiveClients);
app.get('/:UserId/GetClosestLocations/:Latitude/:Longitude',Utilities.GetClosestLocations);


app.get('/:UserId/GetClientLocations/:ClientId',Utilities.GetClientLocations);
app.get('/:UserId/GetMessagesSentByClient/:ClientId',Utilities.GetMessagesSentByClient);
app.get('/:UserId/GetMessagesReceivedByUser',Utilities.GetMessagesReceivedByUser);
app.get('/:UserId/GetLocationsByUser/:UserLocation',Utilities.GetLocationsByUser);
app.get('/:UserId/GetUserActiveState',Utilities.GetUserActiveState);
app.get('/:UserId/UpdateUserActiveState',Utilities.UpdateUserActiveState);
app.get('/:UserId/IsLocationActive/:LocationId',Utilities.IsLocationActive);
app.post('/:UserId/GetFriendsPlaces',Utilities.GetFriendsPlaces);

app.listen(app.get('port'));
console.log("Feature Server - Listening Port: " +app.get('port'));
