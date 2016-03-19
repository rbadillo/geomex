var amqp = require('amqp');
var DAL= require('./Database');

exports.PublishMessage=function PublishMessage(QueueName,OfferId,Devices,MessageTitle,MessageSubtitle,ClientId,ClientName,ClientLogo,SendMessageOnly,callback) {

    var connection = amqp.createConnection({},{ reconnect: false });

    connection.on('ready', function () {

        var exchange= connection.exchange('Near.Messaging',{durable: true, type: 'topic', confirm: true, autoDelete: false})
        // Prepare to Send Message to RabbitMQ

        exchange.on('open', function () {

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

            exchange.publish(QueueName,msj,{},function(err){
                if(err)
                {
                  return callback("ERROR - Publishing to RabbitMQ")  
                }
                else
                {
                    console.log("Message Published Successfully to RabbitMQ");
                    connection.disconnect()
                    return callback(null)
                }     
            });
        })
    });

  connection.on('error', function () {
    return callback("ERROR - Connecting to RabbitMQ")
  });
}