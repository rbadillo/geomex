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
  GetUsersFromUserControl(LocationId,"/GetUsersByLocationId?location_id=",Message);
    
}

function GetUsersFromUserControl(LocationId,Path,Message) {
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
    var Response="";
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          Response= Response + chunk;
      });

      res.on('end', function(){
          //console.log(Response);
          MQ.PublishMessage("PushMessages",LocationId,Response,Message);
      });
  });
}