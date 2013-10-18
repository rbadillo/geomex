var DAL= require('./Database');
var Utilities= require('./UserControlUtilities');
var http= require('http');
var MQ= require('./RabbitMqPublisher');

exports.Test = function Test(req,res){
  res.end('Queue Worker Server - OK');
}

exports.SendMessage = function SendMessage(req,res){
	res.end('Success');
  var LocationId=req.body.location_id
  var Message=req.body.message
  var ClientId=req.body.client_id
  var ClientName=req.body.client_name
  GetUsersFromUserControl(LocationId,"/GetUsersByLocationId?location_id=",Message,ClientId,ClientName);
}

function GetUsersFromUserControl(LocationId,Path,Message,ClientId,ClientName) {
  // Build the post string from an object

  // An object of options to indicate where to post to
  var get_options = {
      host: 'localhost',
      port: '9000',
      path: Path + LocationId,
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  };

  // Set up the request
  var req = http.get(get_options, function(res) {
    var ActiveUsers="";
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          ActiveUsers= ActiveUsers + chunk;
      });

      res.on('end', function(){
          //Inserting Message into DB
          DAL.AddMessage(Message,LocationId,ClientId,function(){
              //Send Message to RabbitMQ
          MQ.PublishMessage("PushMessages",LocationId,ActiveUsers,Message,ClientId,ClientName);
          });
      });
  });
}