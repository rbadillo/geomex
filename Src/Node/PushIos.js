var apn = require ('apn');
var DAL= require('./Database');

// Create a connection to the service using mostly default parameters.
var service = new apn.connection({ gateway:'gateway.sandbox.push.apple.com' });

service.on('connected', function() {
    console.log("Connected to APNS");
});

service.on('transmitted', function(notification, device) {
    console.log("Notification Transmitted Successfully To Device: " + device);
});

service.on('transmissionError', function(errCode, notification, device) {
    console.error("Notification Transmitted With Error To Device: " +device);
    var auxMessage=notification.alert;
    auxMessage=auxMessage.split(":")
    // We are removing the Customer Name from the Message - Starbucks: Hello World
    var message=auxMessage[1].trim()
    var deviceToken= "" +device
    DAL.UpdateSentMessage(deviceToken,message,"Delete");
});

service.on('timeout', function () {
    console.log("Connection Timeout");
    console.log("");
});

service.on('disconnected', function() {
    console.log("Disconnected from APNS");
    console.log("");
});

service.on('socketError', console.error);

// If you plan on sending identical paylods to many devices you can do something like this.
exports.PushMessage=function PushMessage(Message,Devices,ClientName) {
    var note = new apn.notification();
    note.alert= ClientName +": " +Message
    note.sound = "ping.aiff";
    note.badge = 1;
    Devices=Devices.split(",");
    //console.log(Devices);
 
    for(var i=0;i<Devices.length;i++){
        //console.log("Device: " +Devices[i])
        DAL.UpdateSentMessage(Devices[i],Message,"Add");
    }
    
    service.pushNotification(note, Devices);
    service.shutdown();
}
