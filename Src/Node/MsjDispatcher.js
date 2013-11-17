var amqp = require('amqp');
var Ios= require('./PushIos');
var Android= require('./PushAndroid');
var connection = amqp.createConnection();

// Wait for connection to become established.
connection.on('ready', function () {
  // Use the default 'amq.topic' exchange
  var options = { autoDelete: false, durable: true };
  var q = connection.queue('PushMessages',options);

          // Receive messages
          q.subscribe(function (message) {
            // Print messages to stdout
            
            //console.log(message.Users.iOS);
            if(message.hasOwnProperty('Users')){
            
              if(message.Users.hasOwnProperty('iOS')){
                    var iOSPhones= message.Users.iOS
                    //console.log(iOSPhones);

                    if(iOSPhones.length > 0){
                      Ios.PushMessage(message.Message,iOSPhones,message.ClientName);
                    }
                }
            
              if(message.Users.hasOwnProperty('Android')){
                    var AndroidPhones= message.Users.Android
                    //console.log(AndroidPhones);

                    if(AndroidPhones.length > 0){
                      Android.PushMessage(message.Message,AndroidPhones,message.ClientName);
                    }
              }

          }
      });
      
});