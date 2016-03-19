var express = require('express');
var Utilities= require('./QueueWorkerUtilities');
var app = express();

app.configure(function(){
  app.set('port', 7000);
  app.use(express.bodyParser());
  app.use(express.logger());
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
app.post('/SendMessage',Utilities.SendMessage);

app.listen(app.get('port'));
console.log("Queue Worker Server - Listening Port: " +app.get('port'));