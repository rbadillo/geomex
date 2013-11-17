var express = require('express');
var Utilities= require('./OfferServerUtilities');
var app = express();

app.configure(function(){
  app.set('port', 5000);
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(app.router);
  app.use(express.errorHandler());
});

app.get('/',Utilities.Test);
app.get('/:UserId/:Timezone/GetOffers',Utilities.Offers);
app.get('/:UserId/:Timezone/GetOffers/:OfferId',Utilities.SingleOffer);
app.post('/:UserId/Redeem',Utilities.Redeem);

app.listen(app.get('port'));
console.log("Offer Server - Listening Port: " +app.get('port'));