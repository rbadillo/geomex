var gcm = require('node-gcm');
var DAL= require('./Database');

//Server ID
var sender = new gcm.Sender('AIzaSyBJ4dXx1wHgP92z5-jDcHu0qitSaVsVc84');

exports.PushMessage=function PushMessage(MessageTitle,MessageSubtitle,Devices,OfferId,ClientName,ClientLogo,SendMessageOnly) {

        // Create Payload
        var message = new gcm.Message({
            collapseKey: CreateCollapseKey(),
            delayWhileIdle: true,
            timeToLive: 259200,  // 3 days alive
            data: {
                offer_id: OfferId,
                message_title: MessageTitle,
                message_subtitle: MessageSubtitle,
                client_name: ClientName,
                client_logo: ClientLogo
            }
        });


        if(SendMessageOnly=="false"){
            
            DAL.UpdateSentMessageRecursive(Devices,0,MessageSubtitle,"Add",function(){
                SendGCMPush(Devices,0,message,function(){
                    console.log()
                })
            })
        }else{
            SendGCMPush(Devices,0,message,function(){
                console.log()
            })
        }

        
}

function CreateCollapseKey()
{
    var text = "geomex";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function SendGCMPush(Devices,Index,message,callback){

    if(Index >= Devices.length){
        console.log()
        return callback();
    }else{
        // Auxiliary Array
        var aux=[];
        aux.push(Devices[Index]);

        sender.sendNoRetry(message, aux, function (err, result) {
                if(err){
                        console.log("Error:" +err);
                        DAL.UpdateSentMessage(aux[0],Message,"Delete");
                        Index=Index+1
                        SendGCMPush(Devices,Index,message,callback)
                }else{
                        if(result.failure==1){
                            console.log("Failure Sending Message To Device: " +aux[0])
                            DAL.UpdateSentMessage(aux[0],Message,"Delete");
                            Index=Index+1
                            SendGCMPush(Devices,Index,message,callback)
                        }else{
                            console.log("Notification Transmitted Successfully To Device: " +aux[0]);
                            Index=Index+1
                            SendGCMPush(Devices,Index,message,callback)
                        }
                }
            });
        }
}

