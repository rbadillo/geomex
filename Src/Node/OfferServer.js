var express = require('express');
var morgan = require('morgan');
var Utilities= require('./OfferServerUtilities');
var orm = require("orm");
orm.settings.set("connection.reconnect", true);
var app = express();

app.configure(function(){
  app.set('port', 5000);
  app.use(express.bodyParser());
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time'));
  app.use(orm.express("mysql://root:EstaTrivialDb!@localhost/geomex?pool=true",
	{
	    define: function(db, models){
	        db.load('./Models', function(err){
	        	if (err)
                {
                	console.log(err)
                  db.close()
                  process.exit(1)
                }
	        });
	    }
	}));
  app.use(app.router);
  app.use(express.errorHandler());
});

app.get('/',Utilities.Test);
app.get('/:UserId/:Timezone/GetOffers/:ClientId',Utilities.Offers);
app.get('/:UserId/:Timezone/GetOffers/:ClientId/OfferDetails/:OfferId',Utilities.SingleOffer);
app.get('/:UserId/:Timezone/GetOffers/:ClientId/Redeem/:OfferId',Utilities.Redeem);

app.listen(app.get('port'));
console.log("Offer Server - Listening Port: " +app.get('port'));
