var amqp = require('amqp');
var DAL= require('./Database');

var connection = amqp.createConnection();

connection.on('ready', function () {
  //console.log("Conection Ready");
});

exports.PublishMessage=function PublishMessage(QueueName,LocationId,Devices,Message,ClientId,ClientName) {

  // Prepare to Send Message to RabbitMQ
  var q=connection.queue(QueueName);

  var msj= {
          "LocationId": LocationId,
          "Users": JSON.parse(Devices),
          "Message": Message,
          "ClientId": ClientId,
          "ClientName": ClientName
    }

  console.log("Msg Sent to Queue:");
  console.log("");
  console.log(msj);
  console.log("");
  connection.publish(QueueName,msj);
  console.log("Message Published to RabbitMQ");
  console.log("");

}