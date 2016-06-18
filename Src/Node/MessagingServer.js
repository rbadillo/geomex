var express = require('express');
var morgan = require('morgan');
var Utilities= require('./MessagingServerUtilities');
var orm = require("orm");
orm.settings.set("connection.reconnect", true);
var app = express();

app.configure(function(){
  app.set('port', 7000);
  app.use(express.bodyParser());
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time'));
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

app.get('/',Utilities.Test);
app.post('/SendMessage',Utilities.SendMessage);

app.listen(app.get('port'));
console.log("Messaging Server - Listening Port: " +app.get('port'));