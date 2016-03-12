var amqp = require('amqp');
var DAL= require('./Database');

exports.PublishMessage=function PublishMessage(QueueName,OfferId,Devices,MessageTitle,MessageSubtitle,ClientId,ClientName,ClientLogo,SendMessageOnly,callback) {

  var connection = amqp.createConnection();

  connection.on('ready', function () {
      // Prepare to Send Message to RabbitMQ
      connection.queue(QueueName,function(q){

          var msj= {
                  "OfferId": OfferId,
                  "Users": Devices,
                  "MessageTitle": MessageTitle,
                  "MessageSubtitle": MessageSubtitle,
                  "ClientId": ClientId,
                  "ClientName": ClientName,
                  "ClientLogo": ClientLogo,
                  "SendMessageOnly": SendMessageOnly
            }

          console.log("");
          console.log("Msg Sent to Queue:");
          console.log("");
          console.log(msj);
          console.log("");
          connection.publish(QueueName,msj,{},function(err){

            if(err)
            {
              return callback("ERROR - Publishing to RabbitMQ")  
            }
            else
            {
                console.log("Message Published Successfully to RabbitMQ");
                console.log("");
                connection.disconnect()
            }     
          });
      });
  });
}