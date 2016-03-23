var moment = require('moment');

//Global Variables
var emptyResponse = [];

function tryParseJson(str){
    try {
        return JSON.stringify(str);
    } catch (ex) {
        return null;
    }
}

exports.AddMessage = function AddMessage(db,Message,OfferId,ClientId,callback){

    var message = db.models.Messages;

    message.find({Message: Message, OfferId: OfferId, ClientId: ClientId},function (err, msj) {

        if(err)
        {
          console.log(err);
          return callback(err)
        }
        else
        {
            if(msj.length)
            {
              console.log("Existing Message - Message: " +Message +" - ClientId: " +ClientId);
              return callback(null);
            }
            else
            {
              var msj = db.models.Messages();
              msj.Message=Message
              msj.OfferId=OfferId
              msj.ClientId=ClientId
              msj.IsPrivate=1
              msj.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
              
              msj.save(function(err){
                  if (err)
                  {
                      console.log(err);
                      return callback(err)
                  }
                  else
                  {
                      console.log("New Message Added Sucessfully - Message: " +Message +" - ClientId: " +ClientId);
                      return callback(null);
                  }
              });
            }
        }
    });
}


exports.AddUser = function AddUser(db,UserId,DeviceToken,PhoneType,Timezone,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink,FbPhoto,Latitude,Longitude,callback){

    var User= db.models.Users;

    User.get(UserId,function (err, usr) {
        if(err)
        {
          //console.log("New User - UserId: "+UserId);
          var usr = db.models.Users();
          usr.UserId=UserId
          usr.DeviceToken=DeviceToken
          usr.PhoneType=PhoneType
          usr.Timezone=Timezone
          usr.FbName=FbName
          usr.FbLastName=FbLastName
          usr.FbAge=FbAge
          usr.FbBirthday=FbBirthday
          usr.FbEmail=FbEmail
          usr.FbGender=FbGender
          usr.FbSchool=FbSchool
          usr.FbWork=FbWork
          usr.FbLink=FbLink
          usr.FbPhoto=FbPhoto
          usr.LastRegister=moment.utc().format("YYYY-MM-DD HH:mm:ss");

          usr.save(function (err){
               if (err)
               {
                  console.log(err);
                  return callback(err)
               }
               else
               {
                  //console.log("User Added Sucessfully - UserId: "+UserId);
                  if(Event !== undefined && Event.toLowerCase()=="register")
                  {
                    exports.UpdateAppEvents(db,UserId,null,Event,Latitude,Longitude);
                    return callback(null)
                  }
                  else
                  {
                    console.log("ERROR - Wrong Event: " +Event +" - UserId: " +UserId)
                    return callback("ERROR - Wrong Event: " +Event +" - UserId: " +UserId)
                  }
               }
           });   
        }
        else
        {
            //console.log("Existing User - UserId: "+UserId);
            usr.UserId=UserId
            usr.DeviceToken=DeviceToken
            usr.PhoneType=PhoneType
            usr.Timezone=Timezone
            usr.FbName=FbName
            usr.FbLastName=FbLastName
            usr.FbAge=FbAge
            usr.FbBirthday=FbBirthday
            usr.FbEmail=FbEmail
            usr.FbGender=FbGender
            usr.FbSchool=FbSchool
            usr.FbWork=FbWork
            usr.FbLink=FbLink
            usr.FbPhoto=FbPhoto
            usr.LastRegister=moment.utc().format("YYYY-MM-DD HH:mm:ss");
            
            usr.save(function (err){
                 if (err)
                 {
                    console.log(err);
                    return callback(err)
                 }
                 else
                 {
                    //console.log("User Updated Sucessfully - UserId: "+UserId);
                    if(Event !== undefined && Event.toLowerCase()=="register")
                    {
                      exports.UpdateAppEvents(db,UserId,null,Event,Latitude,Longitude);
                      return callback(null)
                    }
                    else
                    {
                        console.log("ERROR - Wrong Event: " +Event +" - UserId: " +UserId)
                        return callback("ERROR - Wrong Event: " +Event +" - UserId: " +UserId)
                    }
                }
             });
          }
    });
}


exports.GeoEvent = function GeoEvent(db,UserId,LocationId,Event,Latitude,Longitude,callback){

    var Local= db.models.Locations;

    Local.get(LocationId,function (err, loc){
        if(err)
        {
            console.log(err + " - Non Existing Location - LocationId: " +LocationId);
            return callback(err)
        }
        else
        {
            //console.log("Existing Location - LocationId: " +LocationId);
            //console.log(loc.ClientId);
            UpdateLocationEvents(db,UserId,loc.ClientId,LocationId,loc.Name,Event,Latitude,Longitude,function(err){
                return callback(err)
            });
        }
    });
}

function UpdateLocationEvents(db,UserId,ClientId,LocationId,LocationName,Event,Latitude,Longitude,callback){

  var LocationEventAnalytics = db.models.LocationEvents();
  LocationEventAnalytics.UserId=UserId
  LocationEventAnalytics.ClientId=ClientId
  LocationEventAnalytics.LocationId=LocationId
  LocationEventAnalytics.LocationName=LocationName
  LocationEventAnalytics.Event=Event
  LocationEventAnalytics.Latitude=Latitude
  LocationEventAnalytics.Longitude=Longitude
  LocationEventAnalytics.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
    
  LocationEventAnalytics.save(function(err){
    if (err)
    {
        console.log(err);
        return callback(err)
    }
    else
    {
         //console.log("LocationEvents Updated Sucessfully - Location: " +LocationName +" - Event: " +Event +" - UserId: " +UserId);
         //console.log("")
         return callback(null)
    }
  });
}

exports.UpdateAppEvents =function UpdateAppEvents(db,UserId,ClientId,Event,Latitude,Longitude){

  var AppEvent= db.models.AppEvents();
  AppEvent.UserId=UserId
  AppEvent.ClientId=ClientId
  AppEvent.Event=Event
  AppEvent.Latitude=Latitude
  AppEvent.Longitude=Longitude
  AppEvent.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
  
  AppEvent.save(function (err) {
       if (err)
       {
          console.log(err);
       }
       else
       {
          //console.log("AppEvent Added Sucessfully - UserId: " +UserId);
          //console.log("");
          return
       }
   });
}


exports.UpdateSentMessageRecursive= function UpdateSentMessageRecursive(db,DeviceTokens,Index,Message,Action,callback){

  if(Index >= DeviceTokens.length){
      console.log()
      return callback();
  }else{
      UpdateSentMessageSerial(db,DeviceTokens[Index],Message,Action,function(){
          Index=Index+1;
          exports.UpdateSentMessageRecursive(db,DeviceTokens,Index,Message,Action,callback)
      })
  }
}

//GetUserIdSerial
function UpdateSentMessageSerial(db,DeviceToken,Message,Action,callback){

  query="Select UserId,DeviceToken,PhoneType from Users where DeviceToken= '" +DeviceToken +"'"

  db.driver.execQuery(query,function (err, user){ 
    if(err)
    {
      console.log(err);
      return callback();
    }
    else
    {
      GetMessageIdSerial(db,user[0].UserId,Message,Action,callback);
    }
  })
}


function GetMessageIdSerial(db,UserId,Message,Action,callback){

  var Msj = db.models.Messages;  
  Msj.find({ Message: Message},function (err,msj){
    if(err)
    {
          console.log(err);
          return callback();
    }
    else
    {
      //console.log(msj[0].MessageId);
      if(Action=="Add")
      {
        AddSentMessageSerial(db,UserId,msj[0].MessageId,callback);
      }
      else if(Action=="Delete")
      {
        DeleteSentMessageSerial(db,UserId,msj[0].MessageId,callback);
      }
      else
      {
        return callback();
      }      
    }
  });
}


function AddSentMessageSerial(db,UserId,MessageId,callback){

  var SentMessage = db.models.SentMessages();
  SentMessage.UserId=UserId
  SentMessage.MessageId=MessageId
  SentMessage.MessageRead=0
  SentMessage.TimeSent=moment.utc().format("YYYY-MM-DD HH:mm:ss");
  
  SentMessage.save(function (err){
    if (err)
    {
      console.log(err);
      return callback();
    }
    else
    {
      //console.log("SentMessage Added Sucessfully");
      return callback();
    }
  });
}


function DeleteSentMessageSerial(db,UserId,MessageId,callback){

  var SentMessage = db.models.SentMessages;
  
  SentMessage.find({ UserId: UserId, MessageId: MessageId }).remove(function (err){
      if(err)
      {
        console.log(err);
        return callback();
      }
      else
      {
        //console.log("SentMessage Deleted Sucessfully");
        return callback();
      }
  });
}


//GetUserId Async
exports.UpdateSentMessage = function UpdateSentMessage(db,DeviceToken,Message,Action){

  query="Select UserId,DeviceToken,PhoneType from Users where DeviceToken= '" +DeviceToken +"'"

  db.driver.execQuery(query,function(err, user){ 
    if(err)
    {
        console.log(err);
    }
    else
    {
        GetMessageId(db,user[0].UserId,Message,Action);
    }
  })
}


function GetMessageId(db,UserId,Message,Action){

  var Msj = db.models.Messages;
  
  Msj.find({ Message: Message},function(err,msj){
    if(err)
    {
      console.log(err);
    }
    else
    {
      //console.log(msj[0].MessageId);
      if(Action=="Add")
      {
        AddSentMessage(db,UserId,msj[0].MessageId);
      }
      else if (Action=="Delete")
      {
        DeleteSentMessage(db,UserId,msj[0].MessageId);
      }
      else
      {
        return
      }
    }
  });
}

function AddSentMessage(db,UserId,MessageId){

  var SentMessage = db.models.SentMessages();
  SentMessage.UserId=UserId
  SentMessage.MessageId=MessageId
  SentMessage.MessageRead=0
  SentMessage.TimeSent=moment.utc().format("YYYY-MM-DD HH:mm:ss");
  
  SentMessage.save(function(err){
    if (err)
    {
      console.log(err);
    }
    else
    {
       //console.log("SentMessage Added Sucessfully");
       return
    }
  });
}


function DeleteSentMessage(db,UserId,MessageId){

  var SentMessage = db.models.SentMessages;
  
  SentMessage.find({ UserId: UserId, MessageId: MessageId }).remove(function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      //console.log("SentMessage Deleted Sucessfully");
      return
    }
  });
}


exports.GetOffers = function GetOffers(db,UserTime,UserId,Timezone,ClientId,callback){

  var offer = db.models.Offers;

  query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId, \
         Offers.ClientId,Offers.Name,Offers.Title,Offers.Subtitle, \
         Offers.Instructions,Offers.Disclaimer, \
         Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
         Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
         Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
         Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
         where (Offers.PublishedDate <= '" +UserTime +"' and '" +UserTime +"' <= Offers.EndDate) \
         and Clients.IsActive=1 and Offers.IsActive=1 \
         and Clients.ClientId=Offers.ClientId and Offers.ClientId=" +ClientId
         +" Order by Offers.IsPrivate DESC,Offers.Priority DESC,Offers.EndDate DESC"

    db.driver.execQuery(query, function (err, offers) { 
       if(err)
       {
          console.log(err);
          return callback(JSON.stringify(emptyResponse))
       }
       else
       {
          GetPrivateOffers(db,UserTime,UserId,offers,Timezone,callback);
       }
    })
}

function GetPrivateOffers(db,UserTime,UserId,PublicOffers,Timezone,callback){

  var privateOffer = db.models.UserPrivateOffers;

  privateOffer.find({StartDate:db.tools.lte(UserTime), EndDate:db.tools.gte(UserTime), UserId:UserId  },function (err, off) {

      if(err)
      {
          console.log(err);
          return callback(JSON.stringify(emptyResponse))
      }
      else
      {
          //console.log(off.length);
          //for(var i=0;i<off.length;i++){
          //console.log("Private OfertaId: " +off[i].OfferId +" - UserId: " +off[i].UserId);
          //}
          GetUserRedemption(db,UserId,PublicOffers,off,Timezone,callback);
      }
  }); 
}

function GetUserRedemption(db,UserId,PublicOffers,PrivateOffers,Timezone,callback){

        var ofertas=[];

        for(var i=0;i<PublicOffers.length;i++){
          ofertas.push(PublicOffers[i].OfferId)
        }

        var ofertasPrivadas= []

        for(var i=0;i<PrivateOffers.length;i++){
          ofertasPrivadas.push(PrivateOffers[i].OfferId)
        }

        
        var redemption = db.models.OfferRedemption;

        redemption.find( {OfferId: ofertas, UserId:UserId},function (err, off) {
              if(err)
              {
                console.log(err);
                return callback(JSON.stringify(emptyResponse))
              }
              else
              {
                //console.log(off.length);
                var ofertasUsadas=[]
                for(var i=0;i<off.length;i++){
                  ofertasUsadas.push(off[i].OfferId);
                }
                FilterOffers(PublicOffers,ofertasPrivadas,PrivateOffers,ofertasUsadas,Timezone,callback);
              }
        });
}

function FilterOffers(PublicOffers,PrivateOffers,PrivateOffersObject,RedemedOffers,Timezone,callback){

var FinalOfferList=[]
var IndexToRemove=[]

// Remove Offers Already Redeemed
  for(var i=0;i<PublicOffers.length;i++){
      for(var j=0;j<RedemedOffers.length;j++){
        if(PublicOffers[i].OfferId==RedemedOffers[j] && PublicOffers[i].MultiUse==0){
          if(IndexToRemove.indexOf(i)==-1){
            IndexToRemove.push(i)
          }
        }
      }
    }

// Remove PrivateOffers Not added to User
    for(var i=0;i<PublicOffers.length;i++){
        var UserPrivateOffer= false;
        if(PublicOffers[i].IsPrivate==1){
          for(var j=0;j<PrivateOffers.length;j++){
            if(PublicOffers[i].OfferId==PrivateOffers[j]){
              UserPrivateOffer=true;
              for(var k=0;k<PrivateOffersObject.length;k++){
                if(PrivateOffers[j]==PrivateOffersObject[k].OfferId){
                  PublicOffers[i].EndDate=PrivateOffersObject[k].EndDate;
                  break;
                }
              }
            }
          }
          if(!UserPrivateOffer){
              if(IndexToRemove.indexOf(i)==-1){
                IndexToRemove.push(i)
              }
          }
        }
    }

// Remove Offers Exceding the TotalRedemption 
    for(var i=0;i<PublicOffers.length;i++){
      if(PublicOffers[i].TotalRedemption!=null){
        if(PublicOffers[i].ActualRedemption>=PublicOffers[i].TotalRedemption){
          if(IndexToRemove.indexOf(i)==-1){
            IndexToRemove.push(i)
          }
        }
      }
    }

// Convert Dates to Local Time
    for(var i=0;i<PublicOffers.length;i++){
      var auxMoment=moment(PublicOffers[i].PublishedDate);
      var PublishedDateLocal=moment.utc([auxMoment.year(),auxMoment.month(),auxMoment.date(),auxMoment.hour(),auxMoment.minutes(),auxMoment.seconds()])

      var auxMoment=moment(PublicOffers[i].StartDate);
      var StartDateLocal=moment.utc([auxMoment.year(),auxMoment.month(),auxMoment.date(),auxMoment.hour(),auxMoment.minutes(),auxMoment.seconds()])
      
      var auxMoment=moment(PublicOffers[i].EndDate);
      var EndDateLocal=moment.utc([auxMoment.year(),auxMoment.month(),auxMoment.date(),auxMoment.hour(),auxMoment.minutes(),auxMoment.seconds()])

      PublicOffers[i].PublishedDate=PublishedDateLocal;
      PublicOffers[i].StartDate=StartDateLocal;
      PublicOffers[i].EndDate=EndDateLocal;
    }

// Adjust UserTimezone
    var now=moment();
    var ServerTimezone=now.format("ZZ")
    ServerTimezone=parseInt(ServerTimezone)/100

    var UserTimezone=Timezone
    UserTimezone=parseInt(UserTimezone)/100

    var TimeDifference=ServerTimezone-UserTimezone

    for(var i=0;i<PublicOffers.length;i++){
      //now.add('hours',TimeDifference)
      PublicOffers[i].PublishedDate=PublicOffers[i].PublishedDate.add('hours',TimeDifference);
      PublicOffers[i].StartDate=PublicOffers[i].StartDate.add('hours',TimeDifference);
      PublicOffers[i].EndDate=PublicOffers[i].EndDate.add('hours',TimeDifference);;
    }



// Final Filter For All Offers
  for(var i=0;i<PublicOffers.length;i++){
      if(IndexToRemove.indexOf(i)==-1){
        // Adding that Offer because is not in the list
        FinalOfferList.push(PublicOffers[i]);
      }
  }

    // Return JSON Object
    return callback(JSON.stringify(FinalOfferList));
}

exports.GetSingleOffer = function GetSingleOffer(db,UserId,OfferId,Latitude,Longitude,callback){

  query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId, \
        Offers.ClientId,Offers.Name,Offers.Title,Offers.Subtitle, \
        Offers.Instructions,Offers.Disclaimer, \
        Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
        Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
        Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
        Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
        where Offers.OfferId=" +OfferId
        +" and Clients.ClientId=Offers.ClientId"

  db.driver.execQuery(query, function (err, offer) { 
    if(err)
    {
      console.log(err);
      return callback(JSON.stringify(emptyResponse))
    }
    else
    {
      if(offer.length)
      {
        UpdateOfferEvents(db,offer[0].ClientId,UserId,OfferId,"Viewed",Latitude,Longitude)
        return callback(JSON.stringify(offer));
      }
      else
      {
        var msj=  [{
                    "State": "OfferId doesn't exist"
                  }]
        return callback(JSON.stringify(msj));
      }
    }
  })
}

exports.RedeemSingleOffer = function RedeemSingleOffer(db,UserId,OfferId,Latitude,Longitude,callback){

  query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId, \
          Offers.ClientId,Offers.Name,Offers.Title,Offers.Subtitle,Offers.Code, \
          Offers.Instructions,Offers.Disclaimer, \
          Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
          Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
          Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
          Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
          where Offers.OfferId=" +OfferId
          +" and Clients.ClientId=Offers.ClientId"

  db.driver.execQuery(query, function (err, offer){ 
    if(err)
    {
      console.log(err);
      return callback(JSON.stringify(emptyResponse))
    }
    else
    {
      if(offer.length)
      {
        Redeem(db,offer[0].ClientId,UserId,OfferId,Latitude,Longitude,function(successFlag){

            if(successFlag)
            {
              return callback(JSON.stringify(offer));
            }
            else
            {
              var msj=  [{
                          "State": "Error Redeeming Offer or Offer Already Redeemed"
                        }]
              return callback(JSON.stringify(msj))
            }
        })
      }
      else
      {
        var msj=  [{
                    "State": "OfferId doesn't exist"
                  }]
        return callback(JSON.stringify(msj));
      }
    }
  })
}


function Redeem(db,ClientId,UserId,OfferId,Latitude,Longitude,callback){

  query="Select MultiUse from Offers Where OfferId=" +OfferId

  db.driver.execQuery(query, function (err, offerFlag) { 

    if(err)
    {
        console.log(err);
        return callback(false)
    }
    else
    {

      var offerRedeemValidation = db.models.OfferRedemption;
      var OfferUseType= offerFlag[0].MultiUse

      offerRedeemValidation.find({ OfferId:OfferId, ClientId:ClientId, UserId:UserId },function (err, offval) {

        if(err)
        {
          console.log(err);
          return callback(false)
        }
        else
        {
          if(offval.length && OfferUseType==0)
          {
            console.log("")
            console.log("UserId: " +UserId +" Already Redeemed OfferId: " +OfferId);
            console.log("")
            return callback(false)
          }
          else
          {
            var offerRedeem = db.models.OfferRedemption();
            offerRedeem.ClientId=ClientId;
            offerRedeem.UserId=UserId;
            offerRedeem.OfferId=OfferId;
            offerRedeem.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");

            offerRedeem.save(function(err) {
                 if (err)
                 {
                    console.log(err);
                    return callback(false)
                 }
                 else
                 {
                    console.log("UserId: " +UserId +" - Redeemed OfferId: " +OfferId);

                    var offer = db.models.Offers;

                    offer.find({ OfferId:OfferId },function (err, off) {

                      if(err)
                      {
                          console.log(err);
                          return callback(false)
                      }
                      else
                      {
                        var ActualRedemption=off[0].ActualRedemption + 1;
                        off[0].ActualRedemption=ActualRedemption;
                        off[0].save(function(err){
                             if (err)
                             {
                                console.log(err);
                                return callback(false)
                             }
                             else
                             {
                                console.log("OfferId: "+OfferId +" - Actual Redemption: " +ActualRedemption)
                                UpdateOfferEvents(db,ClientId,UserId,OfferId,"Presented",Latitude,Longitude)
                                return callback(true)
                             }
                          })
                      }
                    });
                  }
            });
          }
        }
      }) // END OF offerRedeemValidation
    }
  }) // END OF MultiUse Flag
}

function UpdateOfferEvents(db,ClientId,UserId,OfferId,Event,Latitude,Longitude){

  var offer_event = db.models.OfferEvents();
  offer_event.ClientId=ClientId;
  offer_event.UserId=UserId;
  offer_event.OfferId=OfferId;
  offer_event.Event=Event;
  offer_event.Latitude=Latitude;
  offer_event.Longitude=Longitude;
  offer_event.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");

  offer_event.save(function (err){
    if (err)
    {
      console.log(err);
    }
    else
    {
       console.log("UserId: " +UserId +" - Event: " +Event +" - OfferId: " +OfferId);
    }
  });
}


exports.GetAllActiveClients = function GetAllActiveClients(db,callback){

    query="Select ClientId,Name,Logo,ClientHexColor,IsGold,OfferClosestExpiration from Clients \
          where IsActive=1 and ActiveOffers>0 \
          Order by IsGold DESC,OfferClosestExpiration ASC,ClientId ASC"

    db.driver.execQuery(query, function (err, clients) { 
        if(err)
        {
            console.log(err);
            return callback(err,JSON.stringify(emptyResponse))
        }
        else
        {
          return callback(null,JSON.stringify(clients));
        }
    })
}


exports.GetClosestLocations = function GetClosestLocations(db,Latitude,Longitude,Radius,callback){

    query="SELECT Locations.Name,Locations.Latitude,Locations.Longitude,Clients.Logo as ClientLogo, \
           (6378.10 * ACOS(COS(RADIANS(latpoint)) \
                    * COS(RADIANS(latitude)) \
                    * COS(RADIANS(longpoint) - RADIANS(longitude)) \
                    + SIN(RADIANS(latpoint)) \
                    * SIN(RADIANS(latitude)))) AS DistanceInKm \
     FROM Locations,Clients \
     JOIN ( \
           SELECT "  +Latitude   +" AS latpoint, "  +Longitude +" AS longpoint \
       ) AS p \
     WHERE Locations.Latitude \
        BETWEEN latpoint  - (" +Radius +" / 111.045) \
            AND latpoint  + (" +Radius +" / 111.045) \
       AND Locations.Longitude \
        BETWEEN longpoint - (" +Radius +" / (111.045 * COS(RADIANS(latpoint)))) \
            AND longpoint + (" +Radius +" / (111.045 * COS(RADIANS(latpoint)))) \
       AND Locations.IsPrivate=0 \
       AND Locations.ClientId=Clients.ClientId \
       AND Clients.IsActive=1 \
     ORDER BY DistanceInKm \
     LIMIT 15"

    db.driver.execQuery(query,function(err, locations){ 
      if(err)
      {
        return callback(err,JSON.stringify(emptyResponse))
      }
      else
      {
        return callback(null,JSON.stringify(locations));
      }
    })
}


exports.IsOfferValid= function IsOfferValid(db,UserId,OfferId,ClientId,UserTime,callback){

  var msj= [{
              "State": ""
           }]

  query="Select IsActive from Clients \
     where ClientId=" +ClientId

  db.driver.execQuery(query, function (err, client){ 

    if(err)
    {
      console.log(err);
      msj[0].State=0
      return callback(JSON.stringify(msj))
     }
     else
     {
        if(client[0]===undefined)
        {
            console.log("Client Undefined");
            msj[0].State=0
            return callback(JSON.stringify(msj))
        }
        else
        {
          var ClientActive=client[0].IsActive
          if(client.length && ClientActive==1)
          {

            query="Select IsPrivate from Offers \
                         where OfferId=" +OfferId

            db.driver.execQuery(query, function (err, offer) { 

                if(err)
                {
                  console.log(err);
                  msj[0].State=0
                  return callback(JSON.stringify(msj))
                }
                else
                {
                  if(offer[0]===undefined)
                  {
                    console.log("Offer Undefined");
                    msj[0].State=0
                    return callback(JSON.stringify(msj))
                  }
                  else
                  {
                    var OfferUseType=offer[0].IsPrivate
                    if(offer.length && OfferUseType==1)
                    {
                      // Private Offer 
                      query="Select UserPrivateOffers.OfferId from UserPrivateOffers,Offers \
                      where \
                      UserPrivateOffers.OfferId= Offers.OfferId \
                      and Offers.IsActive=1 \
                      and UserPrivateOffers.OfferId=" +OfferId
                      +" and UserPrivateOffers.StartDate<='" +UserTime +"'"
                      +" and '" +UserTime +"' <=UserPrivateOffers.EndDate \
                      and UserPrivateOffers.UserId=" +UserId
                      +" and UserPrivateOffers.OfferId not in \
                      (Select distinct OfferRedemption.OfferId \
                      from OfferRedemption,Offers \
                      where Offers.MultiUse=0 \
                      and Offers.IsActive=1 \
                      and OfferRedemption.UserId=" +UserId 
                      +" and OfferRedemption.OfferId=Offers.OfferId"
                      +" and OfferRedemption.OfferId="+OfferId+")";

                      //console.log(query)

                      db.driver.execQuery(query, function (err, offer) { 
                          if(err)
                          {
                                console.log(err);
                                msj[0].State=0
                                return callback(JSON.stringify(msj))
                          }
                          else
                          {
                            if(offer.length)
                            {
                                msj[0].State=1
                                return callback(JSON.stringify(msj)) 
                            }
                            else
                            {
                                msj[0].State=0
                                return callback(JSON.stringify(msj))
                            }
                          }
                      })

                    }
                    else
                    {
                      // Public Offer
                      query="Select Offers.OfferId from Offers \
                      where \
                      Offers.OfferId=" +OfferId
                      +" and Offers.IsActive=1"
                      +" and Offers.StartDate<='" +UserTime +"'"
                      +" and '" +UserTime +"' <=Offers.EndDate \
                      and Offers.OfferId not in \
                      (Select distinct OfferRedemption.OfferId \
                      from OfferRedemption,Offers \
                      where Offers.MultiUse=0 \
                      and Offers.IsActive=1 \
                      and OfferRedemption.UserId=" +UserId 
                      +" and OfferRedemption.OfferId=Offers.OfferId"
                      +" and OfferRedemption.OfferId="+OfferId+")";

                      //console.log(query)

                      db.driver.execQuery(query, function (err, offer) { 
                        if(err)
                        {
                          console.log(err);
                          msj[0].State=0
                          return callback(JSON.stringify(msj))
                        }
                        else
                        {
                            if(offer.length)
                            {
                                msj[0].State=1
                                return callback(JSON.stringify(msj)) 
                            }
                            else
                            {
                                msj[0].State=0
                                return callback(JSON.stringify(msj))
                            }
                        }
                      })
                    } // End Public Offers
                  } // End Valid Offer
                } // Else No Mysql Offer Private Error
            }) // Query IsPrivate Execution
          }
          else
          {
             msj[0].State=0
             return callback(JSON.stringify(msj))
          } // Client is Inactive
        } // Valid Client Object
      } // Else No Mysql Client IsActive Error
  }) // Query Client IsActive Execution
}

exports.IsLocationActive= function IsLocationActive(db,LocationId,callback){

  var msj= [{
              "State": ""
           }]

  query="Select Locations.IsActive as Location, Clients.IsActive as Client \
  from Locations,Clients \
  where LocationId=" +LocationId +" and Clients.ClientId=Locations.ClientId"

  db.driver.execQuery(query, function (err, active) { 
    if(err)
    {
      console.log(err);
      msj[0].State="Error";
      return callback(JSON.stringify(msj))
    }
    else
    {
      //console.log(active)
      if(active.length)
      {
          if(active[0].Location==1 && active[0].Client==1)
          {
              msj[0].State=1;
          }
          else
          {
            msj[0].State=0;
          }
          return callback(JSON.stringify(msj));
      }
      else
      {
        msj[0].State="Error";
        return callback(JSON.stringify(msj));
      }
    }
  })
}

// LAST 20 Friend Activities
exports.GetFriends = function GetFriends(db,FriendList,callback){

    if(FriendList==undefined || FriendList.length==0)
    {
      return callback(null,JSON.stringify(emptyResponse))
    }
    else
    {
        query="SELECT distinct Users.UserId,Users.FbName,Users.FbLastName,Users.FbPhoto, \
         Users.LastRegister from Users \
         where Users.UserId in  (" +FriendList +") \
         order by Users.LastRegister Desc LIMIT 20"

        db.driver.execQuery(query, function (err, friends) { 

          if(err)
          {
            return callback(err,JSON.stringify(emptyResponse))
          }
          else
          {
            return callback(null,JSON.stringify(friends));
          }
        })
    }
}

// LAST 5 Coupons Redeemed by Friend
exports.GetFriendActivity = function GetFriendActivity(db,FriendId,callback){

    query="Select OfferRedemption.OfferId,Offers.Title,Offers.Subtitle,Offers.EndDate, \
    Offers.PrimaryImage,Offers.SecondaryImage,OfferRedemption.ClientId,Clients.Name as ClientName,Clients.Logo,Max(OfferRedemption.TimeCreated) as TimeCreated \
    from OfferRedemption,Offers,Clients \
    where \
    OfferRedemption.UserId=" +FriendId +" and Clients.ClientId=OfferRedemption.ClientId \
    and Offers.OfferId=OfferRedemption.OfferId \
    and Offers.IsPrivate=0 \
    Group by OfferRedemption.OfferId \
    Order by TimeCreated DESC LIMIT 5";

    db.driver.execQuery(query,function(err,friendActivity){ 

      if(err)
      {
        return callback(err,JSON.stringify(emptyResponse))
      }
      else
      {
        return callback(null,JSON.stringify(friendActivity));
      }
    })
}

// Helper Function For Messages Functionality
exports.GetOffersId = function GetOffersId(db,UserTime,UserId,Timezone,callback){

  var offer = db.models.Offers;

  query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId,Offers.ClientId, \
          Offers.Name,Offers.Title,Offers.Subtitle, \
          Offers.Instructions,Offers.Disclaimer, \
          Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
          Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
          Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
          Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
          where (Offers.PublishedDate <= '" +UserTime +"' and '" +UserTime +"' <= Offers.EndDate) \
          and Clients.IsActive=1 and Offers.IsActive=1 \
          and Clients.ClientId=Offers.ClientId"

  db.driver.execQuery(query, function (err, offers) { 
      if(err)
      {
          console.log(err);
          return callback(JSON.stringify(emptyResponse))
      }
      else
      {
          GetPrivateOffers(db,UserTime,UserId,offers,Timezone,callback);
      }
   })
}

// Helper Function For Messages Functionality
exports.UnreadMessagesNumber = function UnreadMessagesNumber(db,UserId,Offerlist,callback){

    var msj= [{
                "State": ""
             }]

    if(Offerlist.length==0)
    {
      msj[0].State=0;
      return callback(JSON.stringify(msj))
    }
    else
    {

        var offer = db.models.Offers;

        query="Select distinct UserId,MessageId \
        from SentMessages \
        where UserId=" +UserId
        +" and MessageRead=0 \
        and MessageId in (Select MessageId from Messages where IsPrivate=1 \
        and OfferId in (" +Offerlist +") );"

        db.driver.execQuery(query,function(err, Messages){ 
            if(err)
            {
                console.log(err);
                msj[0].State=0;
                return callback(JSON.stringify(msj))
            }
            else
            {
                msj[0].State=Messages.length;
                return callback(JSON.stringify(msj))
            }
          })
    }
}

// Helper Function For Messages Functionality
exports.GetMessages = function GetMessages(db,UserId,Offerlist,callback){

  if(Offerlist.length==0)
  {
    //console.log("UserId: " +UserId +" - OfferList Is Empty")
    return callback(JSON.stringify(emptyResponse))
  }
  else
  {

    var offer = db.models.Offers;

    query="Select distinct MessageId \
    from SentMessages \
    where UserId=" +UserId
    +" and MessageId in (Select MessageId from Messages where IsPrivate=1 \
    and OfferId in (" +Offerlist +") );"

    db.driver.execQuery(query,function(err, Messages){ 

        if(err)
        {
          console.log(err);
          return callback(JSON.stringify(emptyResponse))
        }
        else
        {
          //console.log(Messages)
          GetMessagesPrivate(db,UserId,Messages,callback)
        }
    })
  }
}

// Helper Function For Messages Functionality
function GetMessagesPrivate(db,UserId,Messages,callback){
    var MIds=[]

    for(var i=0;i<Messages.length;i++){
      MIds.push(Messages[i].MessageId)
    }

      if(MIds.length==0)
      {
        //console.log("UserId: " +UserId +" - MessageList Is Empty")
        return callback(JSON.stringify(emptyResponse))
      }
      else
      {
          query="Select Clients.ClientId, Clients.Name as ClientName,Clients.Logo,Clients.ClientHexColor, \
          Messages.MessageId,Messages.Message, Messages.OfferId,SentMessages.MessageRead, \
          Messages.TimeCreated \
          from Clients,Messages,SentMessages \
          where Messages.ClientId=Clients.ClientId \
          and SentMessages.UserId= " +UserId
          +" and Messages.MessageId in (" +MIds +")"
          +" and SentMessages.MessageId=Messages.MessageId" 
          +" Order by SentMessages.MessageRead,Messages.TimeCreated DESC"

          db.driver.execQuery(query,function(err, Messages){ 
                if(err)
                {
                  console.log(err);
                  return callback(JSON.stringify(emptyResponse))
                }
                else
                {
                  //console.log(Messages)
                  return callback(JSON.stringify(Messages))
                }
          })
      }
  }

// Helper Function For Messages Functionality
exports.ReadMessage = function ReadMessage(db,UserId,MessageId,callback){

  var msj= [{
              "State": ""
            }]

  query="Update SentMessages \
        Set MessageRead=1 \
        where UserId=" +UserId
       +" and MessageId=" +MessageId

  db.driver.execQuery(query,function(err, friends){ 
    if(err)
    {
      console.log(err);
      msj[0].State="Error";
      return callback(JSON.stringify(msj))
    }
    else
    {
      db.close();
      msj[0].State=1;
      return callback(JSON.stringify(msj))
    }
  })
}

exports.GetUsersDeviceToken = function GetUsersDeviceToken(db,UserQuery,OfferId,ClientId,SendMessageOnly,callback){

  query=UserQuery

  var ActiveUsers=
  {
      "iOS":[],
      "Android":[]
  }

  var iOS=[]
  var Android=[]
  var UserIds=[]

  db.driver.execQuery(query,function(err, users){ 

    if(err)
    {
        console.log(err);
        return callback(err,null);
    }
    else
    {
        //console.log(users)
        for(var i=0;i<users.length;i++)
        {
          if(users[i].PhoneType=="iOS")
          {
              iOS.push(users[i].DeviceToken)
          }
          else if(users[i].PhoneType=="Android")
          {
              Android.push(users[i].DeviceToken)
          }
          UserIds.push(users[i].UserId)
        }

          //if(SendMessageOnly=="false"){
            //for(var i=0;i<users.length;i++){
              //AddPrivateOfferToUser(users[i].UserId,OfferId,ClientId)
           //}
          //}

          if(SendMessageOnly=="false")
          {
              AddPrivateOfferRecursive(db,UserIds,0,OfferId,ClientId,function(err)
              {
                  if(err)
                  {
                      console.log(err)
                      return callback(err,null);
                  }
                  else
                  {
                      ActiveUsers["iOS"]=iOS;
                      ActiveUsers["Android"]=Android;
                      return callback(null,ActiveUsers);
                  }
              })
          }
          else
          {
            ActiveUsers["iOS"]=iOS;
            ActiveUsers["Android"]=Android;
            return callback(null, ActiveUsers);
          }
    }
  });
}


function AddPrivateOfferRecursive(db,UserIds,Index,OfferId,ClientId,callback){

  if(Index >= UserIds.length)
  {
      return callback(null);
  }
  else
  {
      AddPrivateOfferToUser(db,UserIds[Index],OfferId,ClientId,function(err){
        if(err)
        {
          return callback(err)
        }
        else
        {
          Index=Index+1;
          AddPrivateOfferRecursive(db,UserIds,Index,OfferId,ClientId,callback)
        }
      })
  }
}

function AddPrivateOfferToUser(db,UserId,OfferId,ClientId,callback){

  var User= db.models.Users;
  var Offers= db.models.Offers;

  Offers.get(OfferId,function(err,offer){
      if(err)
      {
        console.log(err +" - Error retrieving data from database - OfferId: " +OfferId);
        return callback(err)
      }
      else
      {
          User.get(UserId,function(err, usr){
              if(err)
              {
                  console.log(err +" - Error retrieving data from database - UserId: " +UserId);
                  return callback(err);
              }
              else
              {
                  var UserPrivateOffers = db.models.UserPrivateOffers();
                  UserPrivateOffers.UserId=UserId
                  UserPrivateOffers.ClientId=ClientId
                  UserPrivateOffers.OfferId=OfferId

                  // Calculate Start and End Date Of Private Offer
                  var LocalTime= moment.utc().zone(usr.Timezone);
                  var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
                  var StartDate=LocalToUtc;
                  var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");
                  UserPrivateOffers.StartDate=LocalToUtc;
                  var End= StartDate.add('minutes',offer.DynamicRedemptionMinutes)

                  if(End.diff(offer.EndDate) > 0)
                  {
                    // Set End Date as Offer End because is greater.
                    UserPrivateOffers.EndDate=moment(offer.EndDate).format("YYYY-MM-DD HH:mm:ss");
                  }
                  else
                  {
                    // Set End Date Dynamic.
                    UserPrivateOffers.EndDate=End.format("YYYY-MM-DD HH:mm:ss");
                  }

                  UserPrivateOffers.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                  
                  UserPrivateOffers.save(function(err){
                       if (err)
                       {
                          console.log(err +" - ERROR Adding PrivateOffer To User: " +UserId +" - OfferId: " +OfferId);
                          return callback(err)
                       }
                       else
                       {
                          console.log("PrivateOffer Added Sucessfully To User: " +UserId +" - OfferId: " +OfferId);
                          return callback(null);
                       }
                   });
              }
          });

      }
  });
}


exports.ShowGeoMessage= function ShowGeoMessage(db,LocationId,callback){
                    
  var msj= [{
              "State": ""
           }]

  query="Select Locations.GeoMessage as LocationMsg,Locations.IsActive as LocationActive, \
  Clients.IsActive as Client from Locations,Clients \
  where LocationId=" +LocationId +" and Clients.ClientId=Locations.ClientId"

  db.driver.execQuery(query,function(err, active){ 

    if(err)
    {
      console.log(err);
      msj[0].State="Error";
      return callback(JSON.stringify(msj))
    }
    else
    {
      //console.log(active)
      if(active.length)
      {
          if(active[0].LocationActive==1 && active[0].LocationMsg==1 && active[0].Client==1)
          {
              msj[0].State=1;
          }
          else
          {
            msj[0].State=0;
          }
          return callback(JSON.stringify(msj));
      }
      else
      {
        msj[0].State="Error";
        return callback(JSON.stringify(msj));
      }
    }
  })
}
