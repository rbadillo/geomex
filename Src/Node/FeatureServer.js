var express = require('express');
var morgan = require('morgan');
var Utilities= require('./FeatureServerUtilities');
var orm = require("orm");
orm.settings.set("connection.reconnect", true);
var app = express();

app.configure(function(){
  app.set('port', 4000);
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

app.listen(app.get('port'));
console.log("Feature Server - Listening Port: " +app.get('port'));
