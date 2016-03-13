var amqp = require('amqp');
var Ios= require('./PushIos');
var Android= require('./PushAndroid');
var connection = amqp.createConnection();

// Wait for connection to become established.
connection.on('ready', function () {
  console.log("MsgDispatcher - Connected to RabbitMQ")
  // Use the default 'amq.topic' exchange
  var options = { autoDelete: false, durable: true };
  var q = connection.queue('Near.Messaging.PushMessages',options);

          // Receive messages
          q.subscribe(function (message) {
            console.log()
            console.log("Start - " +new Date());
            console.log("MsgDispatcher - Got Message From RabbitMQ")
            // Print messages to stdout

            if(message.hasOwnProperty('Users')){
            
            
              if(message.Users.hasOwnProperty('iOS')){
                    var iOSPhones= message.Users.iOS
                    //console.log(iOSPhones);

                    if(iOSPhones.length > 0){
                      console.log("MsgDispatcher - Sending Push To iOS Devices")
                      Ios.PushMessage(message.MessageSubtitle,iOSPhones,message.ClientName,message.SendMessageOnly);
                    }else{
                      console.log("MsgDispatcher - Not Active iOS Users To Send Push Notification")
                    }
                }
            
            
              if(message.Users.hasOwnProperty('Android')){
                    var AndroidPhones= message.Users.Android
                    //console.log(AndroidPhones);

                    if(AndroidPhones.length > 0){
                      console.log("MsgDispatcher - Sending Push To Android Devices")
                      //MessageTitle,MessageSubtitle,Devices,OfferId,ClientName,ClientLogo
                      Android.PushMessage(message.MessageTitle,message.MessageSubtitle,AndroidPhones,message.OfferId,message.ClientName,message.ClientLogo,message.SendMessageOnly);
                    }else{
                      console.log("MsgDispatcher - Not Active Android Users To Send Push Notification")
                    }
              }

          }else{
            console.log("MsgDispatcher - Got Message Without Users Property From RabbitMQ")
            console.log("Message Received: ");
            console.log("");
            console.log(message)
            console.log("");
          }
      });
      
});