var apn = require ('apn');

// Create a connection to the service using mostly default parameters.
var service = new apn.connection({ gateway:'gateway.sandbox.push.apple.com' });

service.on('connected', function() {
    console.log("Connected to APNS");
});

service.on('transmitted', function(notification, device) {
    console.log("Notification Transmitted Successfully To Device: " + device);
});

service.on('transmissionError', function(errCode, notification, device) {
    //console.error("Notification caused error: " + errCode + " for device ", device, notification);
    console.error("Notification Transmitted With Error To Device: " +device);
});

service.on('timeout', function () {
    console.log("Connection Timeout");
});

service.on('disconnected', function() {
    console.log("Disconnected from APNS");
});

service.on('socketError', console.error);

// If you plan on sending identical paylods to many devices you can do something like this.
exports.PushMessage=function PushMessage(Message,Devices) {
    var note = new apn.notification();
    note.alert= Message
    note.sound = "ping.aiff";
    note.badge = 1;
    Devices=Devices.split(",");
    //console.log(Devices);
    service.pushNotification(note, Devices);
}
