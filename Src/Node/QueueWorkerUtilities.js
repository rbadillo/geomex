var DAL= require('./Database');
var http= require('http');
var MQ= require('./RabbitMqPublisher');

exports.Test = function Test(req,res){
  res.end('Queue Worker Server - OK');
}

exports.SendMessage = function SendMessage(req,res){
	res.end('Success');

  console.log()
  var OfferId=req.body.offer_id
  var OfferExpirationMinutes=req.body.offer_expiration_minutes
  var MessageTitle=req.body.message_title
  var MessageSubtitle=req.body.message_subtitle
  var ClientId=req.body.client_id
  var ClientName=req.body.client_name
  var ClientLogo=req.body.client_logo
  var UserQuery=req.body.user_query
  var SendMessageOnly=req.body.send_message_only.toLowerCase()

  DAL.GetUsersDeviceToken(UserQuery,OfferId,ClientId,OfferExpirationMinutes,SendMessageOnly,function(ActiveUsers){

    DAL.AddMessage(MessageSubtitle,OfferId,ClientId,function(){
      //Send Message to RabbitMQ
      MQ.PublishMessage("PushMessages",OfferId,ActiveUsers,MessageTitle,MessageSubtitle,ClientId,ClientName,ClientLogo,SendMessageOnly);
    });

  });
}
