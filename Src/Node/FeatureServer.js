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
app.post('/:UserId/GetFriends',Utilities.GetFriends);
app.get('/:UserId/GetFriendActivity/:FriendId',Utilities.GetFriendActivity);
app.get('/:UserId/IsLocationActive/:LocationId',Utilities.IsLocationActive);
app.get('/:UserId/:Timezone/GetUnreadMessages',Utilities.GetUnreadMessages);
app.get('/:UserId/:Timezone/GetMessages',Utilities.GetMessages);
app.get('/:UserId/ReadMessage/:MessageId',Utilities.ReadMessage);
app.get('/:UserId/ShowGeoMessage/:LocationId',Utilities.ShowGeoMessage);

app.listen(app.get('port'));
console.log("Feature Server - Listening Port: " +app.get('port'));
