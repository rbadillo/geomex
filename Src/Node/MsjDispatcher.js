var amqp = require('amqp');
var Ios= require('./PushIos');
var Android= require('./PushAndroid');
var connection = amqp.createConnection();

// Wait for connection to become established.
connection.on('ready', function () {
  console.log("MsjDispatcher - Connected to RabbitMQ")
  // Use the default 'amq.topic' exchange
  var options = { autoDelete: false, durable: true };
  var q = connection.queue('PushMessages',options);

          // Receive messages
          q.subscribe(function (message) {
            console.log("MsjDispatcher - Got Message From RabbitMQ")
            // Print messages to stdout
            
            //console.log(message.Users.iOS);
            if(message.hasOwnProperty('Users')){
            
              if(message.Users.hasOwnProperty('iOS')){
                    var iOSPhones= message.Users.iOS
                    //console.log(iOSPhones);

                    if(iOSPhones.length > 0){
                      console.log("MsjDispatcher - Sending Push To iOS Devices")
                      Ios.PushMessage(message.Message,iOSPhones,message.ClientName);
                    }else{
                      console.log("MsjDispatcher - Not Active iOS Users To Send Push Notification")
                    }
                }
            
              if(message.Users.hasOwnProperty('Android')){
                    var AndroidPhones= message.Users.Android
                    //console.log(AndroidPhones);

                    if(AndroidPhones.length > 0){
                      console.log("MsjDispatcher - Sending Push To Android Devices")
                      Android.PushMessage(message.Message,AndroidPhones,message.ClientName);
                    }else{
                      console.log("MsjDispatcher - Not Active Android Users To Send Push Notification")
                    }
              }

          }else{
            console.log("MsjDispatcher - Got Message Without Users Property From RabbitMQ")
            console.log(message)
          }
      });
      
});