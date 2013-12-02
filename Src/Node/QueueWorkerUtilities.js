var DAL= require('./Database');
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
  var Visibility=req.body.visibility
  GetUsersFromUserControl(LocationId,"/GetUsersByLocationId/",Message,ClientId,ClientName,Visibility);
}

function GetUsersFromUserControl(LocationId,Path,Message,ClientId,ClientName,Visibility) {
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

      res.on('error', function(e){
          console.log(e)
      });

      res.on('end', function(){
          //Inserting Message into DB
          DAL.AddMessage(Message,LocationId,ClientId,Visibility,function(){
              //Send Message to RabbitMQ
          MQ.PublishMessage("PushMessages",LocationId,ActiveUsers,Message,ClientId,ClientName);
          });
      });
  });

  // Handle Error If User Control Server is Down
  req.on('error', function(e){
          console.log("User Control Server - Not Available - " +Date())
  });

}