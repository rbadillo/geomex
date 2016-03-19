var express = require('express');
var Utilities= require('./RegisterServerUtilities');
var orm = require("orm");
orm.settings.set("connection.reconnect", true);
var app = express();

app.configure(function(){
  	app.set('port', 8000);
	app.use(express.bodyParser());
	app.use(express.logger('dev'));
	app.use(orm.express("mysql://root:EstaTrivialDb!@localhost/geomex",
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

express.logger.token('date', function(){
  return new Date();
});

app.get('/',Utilities.Test);
app.post('/:UserId/Register',Utilities.Register);
app.post('/:UserId/GeoEvent',Utilities.GeoEvent);

app.listen(app.get('port'));
console.log("Register Server - Listening Port: " +app.get('port'));
