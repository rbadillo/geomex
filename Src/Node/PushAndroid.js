var gcm = require('node-gcm');
var DAL= require('./Database');

//Server ID
var sender = new gcm.Sender('AIzaSyBJ4dXx1wHgP92z5-jDcHu0qitSaVsVc84');

exports.PushMessage=function PushMessage(db,MessageTitle,MessageSubtitle,Devices,OfferId,ClientName,ClientLogo,SendMessageOnly){

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


    if(SendMessageOnly=="false")
    {
        DAL.UpdateSentMessageRecursive(db,Devices,0,MessageSubtitle,"Add",function(){
            SendGCMPush(db,Devices,0,message,SendMessageOnly,function(){
                console.log()
            })
        })
    }
    else
    {
        SendGCMPush(db,Devices,0,message,SendMessageOnly,function(){
            console.log()
        })
    }    
}

function CreateCollapseKey()
{
    var text = "near";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function SendGCMPush(db,Devices,Index,Message,SendMessageOnly,callback){

    if(Index >= Devices.length)
    {
        console.log()
        return callback();
    }
    else
    {
        // Auxiliary Array
        var tempDevice=[];
        tempDevice.push(Devices[Index]);

        sender.sendNoRetry(Message, tempDevice, function (err, result) {
            if(err)
            {
                console.log("Error:" +err);
                if(SendMessageOnly=="false")
                {
                    DAL.UpdateSentMessage(db,tempDevice[0],Message.data.message_subtitle,"Delete");
                }
                Index=Index+1
                SendGCMPush(db,Devices,Index,Message,SendMessageOnly,callback)
            }
            else
            {
                if(result.failure==1)
                {
                    console.log("Failure Sending Message To Device: " +tempDevice[0])
                    if(SendMessageOnly=="false")
                    {
                        DAL.UpdateSentMessage(db,tempDevice[0],Message.data.message_subtitle,"Delete");
                    }
                    Index=Index+1
                    SendGCMPush(db,Devices,Index,Message,SendMessageOnly,callback)
                }
                else
                {
                    console.log("Notification Transmitted Successfully To Device: " +tempDevice[0]);
                    Index=Index+1
                    SendGCMPush(db,Devices,Index,Message,SendMessageOnly,callback)
                }
            }
        });
    }
}

