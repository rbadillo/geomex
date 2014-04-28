var express = require('express');
var Utilities= require('./RouterServerUtilities');
var app = express();

app.configure(function(){
  app.set('port', 80);
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(app.router);
  app.use(express.errorHandler());
});

express.logger.token('date', function(){
  return new Date();
});


//FeatureServer
app.get('/:UserId/GetAllActiveClients',Utilities.GetAllActiveClients);
app.get('/:UserId/GetClosestLocations/:Latitude/:Longitude',Utilities.GetClosestLocations);
app.post('/:UserId/GetFriends',Utilities.GetFriends);
app.get('/:UserId/GetFriendActivity/:FriendId',Utilities.GetFriendActivity);
app.get('/:UserId/IsLocationActive/:LocationId',Utilities.IsLocationActive);
app.get('/:UserId/:Timezone/GetUnreadMessages',Utilities.GetUnreadMessages);
app.get('/:UserId/:Timezone/GetMessages',Utilities.GetMessages);
app.get('/:UserId/ReadMessage/:MessageId',Utilities.ReadMessage);
app.get('/:UserId/:Timezone/ShowGeoMessage/:ClientId/LocationId/:LocationId/OfferId/:OfferId',Utilities.ShowGeoMessage);
app.post('/:UserId/AppEvent',Utilities.AppEvent);

//OfferServer
app.get('/:UserId/:Timezone/GetOffers/:ClientId',Utilities.Offers);
app.get('/:UserId/:Timezone/GetOffers/:ClientId/OfferDetails/:OfferId',Utilities.SingleOffer);
app.get('/:UserId/:Timezone/GetOffers/:ClientId/Redeem/:OfferId',Utilities.Redeem);

//RegisterServer
app.post('/:UserId/Register',Utilities.Register);
app.post('/:UserId/GeoEvent',Utilities.GeoEvent);

//QueueWorker
app.post('/SendMessage',Utilities.SendMessage);


app.listen(app.get('port'));
console.log("Router Server - Listening Port: " +app.get('port'));
