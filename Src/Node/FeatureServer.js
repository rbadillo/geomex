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

app.get('/',Utilities.Test);
app.get('/:UserId/:ClientId/GetMessagesSentByClient',Utilities.GetMessagesSentByClient);
app.get('/:UserId/:ClientId/GetMessagesReceivedByUser',Utilities.GetMessagesReceivedByUser);
app.get('/:UserId/:ClientId/GetLocationsByUser/:UserLocation',Utilities.GetLocationsByUser);
app.post('/:UserId/GetFriendsPlaces',Utilities.GetFriendsPlaces);

app.listen(app.get('port'));
console.log("Offer Server - Listening Port: " +app.get('port'));