var express = require('express');
var Utilities= require('./RegisterServerUtilities');
var app = express();

app.configure(function(){
  app.set('port', 8000);
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(app.router);
  app.use(express.errorHandler());
});

express.logger.token('date', function(){
  return new Date();
});

app.get('/',Utilities.Test);
app.post('/Register',Utilities.Register);

app.listen(app.get('port'));
console.log("Register Server - Listening Port: " +app.get('port'));