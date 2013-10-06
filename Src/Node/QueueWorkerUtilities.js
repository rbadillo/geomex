var DAL= require('./Database');
var Utilities= require('./UserControlUtilities');
var http= require('http');
var MQ= require('./RabbitMqPublisher');

exports.Test = function Test(req,res){
  res.end('hello world');
}

exports.SendMessage = function SendMessage(req,res){
	res.end('Success');

  var LocationId=req.body.location_id
  var Message=req.body.message
  GetUsersFromUserControl(LocationId,"/GetUsersByLocationId",Message);
    
}

function GetUsersFromUserControl(LocationId,Path,Message) {
  // Build the post string from an object
  var LocationObject={
    "location_id" : LocationId,
  }

  var post_data = tryParseJson(LocationObject);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '9000',
      path: Path,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
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

  // post the data
  post_req.write(post_data);
  post_req.end();

}

function tryParseJson(str) {
    try {
        return JSON.stringify(str);
    } catch (ex) {
        return null;
    }
}
