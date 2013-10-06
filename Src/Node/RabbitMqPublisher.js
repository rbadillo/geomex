var amqp = require('amqp');
var connection = amqp.createConnection();

connection.on('ready', function () {
  //console.log("Conection Ready");
});

exports.PublishMessage=function PublishMessage(QueueName,LocationId,Devices,Message) {

  var q=connection.queue(QueueName);

  var msj= {
          "LocationId": LocationId,
          "Users": JSON.parse(Devices),
          "Message": Message
    }

  console.log(msj);
  connection.publish(QueueName,msj);
  console.log("Message Published to RabbitMQ");

}