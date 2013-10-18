var gcm = require('node-gcm');
var DAL= require('./Database');

//Server ID
var sender = new gcm.Sender('AIzaSyBBOTq-W10C642PZv8dClTtxCZULhaOXY0');

exports.PushMessage=function PushMessage(Message,Devices,ClientName) {

        // Create Payload
        var message = new gcm.Message({
            collapseKey: 'geomex',
            delayWhileIdle: true,
            timeToLive: 259200,  // 3 days alive
            data: {
                key1: ClientName,
                key2: Message
            }
        });

        var Devices=Devices.split(",");

        // Update Analytics
        for(var i=0;i<Devices.length;i++){
            //console.log("Device: " +Devices[i])
            DAL.UpdateSentMessage(Devices[i],Message,"Add");
        }

        for(var i=0;i<Devices.length;i++){
                // Auxiliary Array
                var aux=[];
                aux.push(Devices[i]);

                sender.sendNoRetry(message, aux, function (err, result) {
                    if(err){
                        console.log("Error:" +err);
                        DAL.UpdateSentMessage(aux[0],Message,"Delete");
                    }else{
                        if(result.failure==1){
                            DAL.UpdateSentMessage(aux[0],Message,"Delete");
                        }else{
                            console.log("Notification Transmitted Successfully To Device: " +aux[0]);
                        }
                    }
                });
        }
}