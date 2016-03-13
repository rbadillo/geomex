var DAL= require('./Database');
var http= require('http');
var MQ= require('./RabbitMqPublisher');

exports.Test = function Test(req,res){
  res.end('Queue Worker Server - OK');
}

exports.SendMessage = function SendMessage(req,res){

  var OfferId=req.body.offer_id
  var MessageTitle=req.body.message_title
  var MessageSubtitle=req.body.message_subtitle
  var ClientId=req.body.client_id
  var ClientName=req.body.client_name
  var ClientLogo=req.body.client_logo
  var UserQuery=req.body.user_query
  var SendMessageOnly=req.body.send_message_only.toLowerCase()

  DAL.GetUsersDeviceToken(UserQuery,OfferId,ClientId,SendMessageOnly,function(err,ActiveUsers){

    if(err)
    {
        return res.end('ERROR - ' +err);
    }
    else
    {

      DAL.AddMessage(MessageSubtitle,OfferId,ClientId,function(err){

        if(err)
        {
          return res.end('ERROR - ' +err);
        }
        else
        {
          //Sending Message to RabbitMQ
          MQ.PublishMessage("Near.Messaging.PushMessages",OfferId,ActiveUsers,MessageTitle,MessageSubtitle,ClientId,ClientName,ClientLogo,SendMessageOnly,function(err){
              if(err)
              {
                  console.log(err)
                  return res.end("ERROR - " +err)
              }
              else
              {
                return res.end("Success")
              }
          });
        }
      });
    }

  });
}
