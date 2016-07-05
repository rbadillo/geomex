var DAL= require('./Database');
var http= require('http');
var MQ= require('./RabbitMqPublisher');

exports.Test = function Test(req,res){
  res.end('Messaging Server - OK');
}

exports.SendMessage = function SendMessage(req,res){

  var OfferId=req.body.offer_id
  var MessageTitle=req.body.message_title
  var MessageSubtitle=req.body.message_subtitle
  var ClientId=req.body.client_id
  var ClientName=req.body.client_name
  var ClientLogo=req.body.client_logo
  var UserQuery=req.body.user_query
  var AddMessageOnly=req.body.add_message_only.toLowerCase()
  var SendMessageOnly=req.body.send_message_only.toLowerCase()

  DAL.GetUsersDeviceToken(req.db,UserQuery,OfferId,ClientId,AddMessageOnly,SendMessageOnly,function(err,ActiveUsers){
    if(err)
    {
        res.statusCode=406
        return res.end('ERROR - ' +err);
    }
    else
    {
      DAL.AddMessage(req.db,MessageSubtitle,OfferId,ClientId,function(err){
        if(err)
        {
          res.statusCode=406
          return res.end('ERROR - ' +err);
        }
        else
        {
          if(AddMessageOnly=="true")
          {
            var Devices = []
            if(ActiveUsers.hasOwnProperty('iOS'))
            {
              Devices.push.apply(Devices,ActiveUsers['iOS'])
            }

            if(ActiveUsers.hasOwnProperty('Android'))
            {
              Devices.push.apply(Devices,ActiveUsers['Android'])
            }

            DAL.UpdateSentMessageRecursive(req.db,Devices,0,MessageSubtitle,"Add",function(){
                return res.end("Success")
            })
          }
          else
          {
            //Sending Message to RabbitMQ
            MQ.PublishMessage("PushMessages",OfferId,ActiveUsers,MessageTitle,MessageSubtitle,ClientId,ClientName,ClientLogo,SendMessageOnly,function(err){
                if(err)
                {
                    res.statusCode=406
                    return res.end("ERROR - " +err)
                }
                else
                {
                  return res.end("Success")
                }
            });
          }
        }
      });
    }
  });
}
