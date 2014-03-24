var amqp = require('amqp');
var DAL= require('./Database');

var connection = amqp.createConnection();

connection.on('ready', function () {
  //console.log("Conection Ready");
});

exports.PublishMessage=function PublishMessage(QueueName,OfferId,Devices,MessageTitle,MessageSubtitle,ClientId,ClientName,ClientLogo,SendMessageOnly) {

  // Prepare to Send Message to RabbitMQ
  var q=connection.queue(QueueName);

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
  connection.publish(QueueName,msj);
  console.log("Message Published to RabbitMQ");
  console.log("");

}