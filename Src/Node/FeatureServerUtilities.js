var DAL= require('./Database');
var moment = require('moment');

exports.Test = function Test(req,res){
	res.end('Feature Server - OK');
}

exports.GetAllActiveClients = function GetAllActiveClients(req,res){

    var UserId=req.params.UserId

    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      DAL.GetAllActiveClients(db,function (err,output){

        if(err)
        {
          console.log(err)
          res.setHeader('Content-Type', 'application/json');
          res.statusCode=406
          res.write(output);
          res.end();
        }
        else
        {
          console.log("");
          console.log("GetAllActiveClients - UserId: " +UserId)
          console.log("");

          res.setHeader('Content-Type', 'application/json');
          res.write(output);
          res.end();
        }
      });  
    }  
}

exports.GetClosestLocations = function GetClosestLocations(req,res){

    var UserId=req.params.UserId
    var Latitude=req.params.Latitude
    var Longitude=req.params.Longitude
    var Radius= req.query.radius

    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {

      if(Latitude == null || Latitude == undefined || Longitude == null || Longitude == undefined)
      {
          console.log("");
          console.log("ERROR - Latitude/Longitude can't be NULL or Undefined");
          console.log("");

          res.setHeader('Content-Type', 'application/json');
          res.statusCode=406
          var msj=  [{
                      "State": "Latitude/Longitude can't be NULL or Undefined"
                    }]
          var response= JSON.stringify(msj)
          res.write(response);
          res.end();
      }
      else
      {
        if(Radius==undefined)
        {
          Radius=50;
        }
        else
        {
          Radius=parseInt(Radius)
          if(isNaN(Radius))
          {
            Radius=50;
          }
        }

        DAL.GetClosestLocations(req.db,Latitude,Longitude,Radius,function (err,output){
            if(err)
            {
              console.log(err)
              res.setHeader('Content-Type', 'application/json');
              res.statusCode=406
              res.write(output);
              res.end();
            }
            else
            {
              console.log("");
              console.log("GetClosestLocations - UserId: " +UserId +" - Latitude: " +Latitude +" - Longitude: " +Longitude +" - Radius: " +Radius +" Km")
              console.log("");

              res.setHeader('Content-Type', 'application/json');
              res.write(output);
              res.end();
            }
        });
      }
    }  
}


exports.GetFriends = function GetFriends(req,res){

    var UserId=req.params.UserId

    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      var FriendList=req.body.friend_list

      DAL.GetFriends(req.db,FriendList,function(err,output){
        if(err)
        {
            console.log(err)
            res.setHeader('Content-Type', 'application/json');
            res.statusCode=406
            res.write(output);
            res.end();
        }
        else
        {
          console.log("");
          console.log("GetFriendsPlaces - UserId: " +UserId)
          console.log("Friend Ids: " +FriendList)
          console.log("");

          res.setHeader('Content-Type', 'application/json');
          res.write(output);
          res.end();
        }
      });
    }    
}


exports.GetFriendActivity = function GetFriendActivity(req,res){

    var UserId=req.params.UserId

    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      var FriendId=req.params.FriendId

      if(FriendId == null || FriendId=="null" ||  FriendId == undefined || FriendId=="undefined" || FriendId=="(null)")
      {
        console.log("");
        console.log("ERROR - FriendId can't be NULL or Undefined");
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "FriendId can't be NULL or Undefined"
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }
      else
      {
        DAL.GetFriendActivity(req.db,FriendId,function(err,output){
          if(err)
          {
              console.log(err)
              res.setHeader('Content-Type', 'application/json');
              res.statusCode=406
              res.write(output);
              res.end();
          }
          else
          {
            console.log("");
            console.log("GetFriendActivity - UserId: " +UserId +" - FriendId: " +FriendId)
            console.log("");

            res.setHeader('Content-Type', 'application/json');
            res.write(output);
            res.end();
          }
        });    
      }
    }
}

exports.IsLocationActive= function IsLocationActive(req,res){

    var UserId=req.params.UserId

    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      var LocationId=req.params.LocationId

      if(LocationId == null || LocationId == undefined)
      {
        console.log("");
        console.log("ERROR - LocationId can't be NULL or Undefined");
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "LocationId can't be NULL or Undefined"
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }
      else
      {
        DAL.IsLocationActive(req.db,LocationId,function(output){
          console.log("");
          console.log("IsLocationActive - UserId: " +UserId +" - LocationId: " +LocationId +" - Active State: " +tmp[0].State)
          console.log("");

          var tmp= JSON.parse(output)
          res.setHeader('Content-Type', 'application/json');
          if(tmp[0].State=="Error")
          {
            res.statusCode=406
          }
          res.write(output);
          res.end();
        });
      }
    }
}

exports.GetUnreadMessages= function GetUnreadMessages(req,res){

    var UserId=req.params.UserId

    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      var Timezone=req.params.Timezone

      if(Timezone == null || Timezone == undefined)
      {
        console.log("");
        console.log("ERROR - Timezone can't be NULL or Undefined");
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "Timezone can't be NULL or Undefined"
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }
      else
      {
        var LocalTime= moment.utc().zone(Timezone);
        var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
        var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

        DAL.GetOffersId(LocalToUtc,UserId,Timezone,function (output){
              var OfferIds=[]
              var tmp=JSON.parse(output);
              for(var i=0;i<tmp.length;i++){
                OfferIds.push(tmp[i].OfferId);
              }
              // if Array is Empty Avoid Proceeding
              if(tmp.length==0)
              {
                res.setHeader('Content-Type', 'application/json');
                res.write(output);
                res.end();
              }
              else
              {
                DAL.UnreadMessagesNumber(req.db,UserId,OfferIds,function(output){
                  console.log("");
                  console.log("GetUnreadMessages - UserId: " +UserId +" - UnreadMessages: " +tmp[0].State)
                  console.log("");

                  var tmp=JSON.parse(output);

                  res.setHeader('Content-Type', 'application/json');
                  res.write(output);
                  res.end();
                })
              }
        });
      }
    }
}

exports.GetMessages= function GetMessages(req,res){

    var UserId=req.params.UserId
    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      var Timezone=req.params.Timezone

      if(Timezone == null || Timezone == undefined)
      {
        console.log("");
        console.log("ERROR - Timezone can't be NULL or Undefined");
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "Timezone can't be NULL or Undefined"
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }
      else
      {
        var LocalTime= moment.utc().zone(Timezone);
        var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
        var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

        DAL.GetOffersId(req.db,LocalToUtc,UserId,Timezone,function(output){
              var OfferIds=[]
              var tmp=JSON.parse(output);
              for(var i=0;i<tmp.length;i++){
                OfferIds.push(tmp[i].OfferId);
              }
              // if Array is Empty Avoid Proceeding
              if(tmp.length==0)
              {
                res.setHeader('Content-Type', 'application/json');
                res.write(output);
                res.end();
              }
              else
              {
                DAL.GetMessages(req.db,UserId,OfferIds,function(output){
                  console.log("");
                  console.log("GetMessages - UserId: " +UserId)
                  console.log("");

                  res.setHeader('Content-Type', 'application/json');
                  res.write(output);
                  res.end();
                })
              }
          });
      }
    }
}


exports.ReadMessage= function ReadMessage(req,res){

    var UserId=req.params.UserId
    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {

      var MessageId=req.params.MessageId
      if(MessageId == null || MessageId == undefined)
      {
        console.log("");
        console.log("ERROR - MessageId can't be NULL or Undefined");
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "MessageId can't be NULL or Undefined"
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }
      else
      {
        DAL.ReadMessage(req.db,UserId,MessageId,function(output){
          console.log("");
          console.log("ReadMessage - UserId: " +UserId +" - MessageId: " +MessageId +" - Status: " +tmp[0].State)
          console.log("");

          var tmp= JSON.parse(output)
          if( tmp.length==0 || tmp[0].hasOwnProperty("State") && tmp[0].State=="Error")
          {
            res.statusCode=406
          }
          res.setHeader('Content-Type', 'application/json');
          res.write(output);
          res.end();
        });
      }
    }
}


exports.ShowGeoMessage= function ShowGeoMessage(req,res){

    var UserId=req.params.UserId
    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {
      var ClientId=req.params.ClientId
      var LocationId=req.params.LocationId
      var OfferId=req.params.OfferId
      var Timezone=req.params.Timezone
      var LocalTime= moment.utc().zone(Timezone);
      var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
      var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

      if(LocationId == null || LocationId == undefined || ClientId == null || ClientId == undefined 
        || OfferId == null || OfferId == undefined || Timezone == null || Timezone == undefined )
      {
        console.log("");
        console.log("ERROR - Required Content can't be NULL or Undefined");
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "Required Content can't be NULL or Undefined"
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }
      else
      {

        DAL.ShowGeoMessage(req.db,LocationId,function(output){
          var tmp= JSON.parse(output)
          if(tmp[0].State=="Error")
          {
            console.log("");
            console.log("ERROR - ShowGeoMessage - UserId: " +UserId +" - ClientId: " +ClientId +" - LocationId: " +LocationId +" - Status: " +tmp[0].State)
            console.log("");

            res.statusCode=404
            res.setHeader('Content-Type', 'application/json');
            res.write(output);
            res.end();
          }
          else if(tmp[0].State==0)
          {
            console.log("");
            console.log("ShowGeoMessage - UserId: " +UserId +" - ClientId: " +ClientId +" - LocationId: " +LocationId +" - Status: " +tmp[0].State)
            console.log("");

            res.setHeader('Content-Type', 'application/json');
            res.write(output);
            res.end();
          }
          else
          {
            DAL.IsOfferValid(req.db,UserId,OfferId,ClientId,LocalToUtc,function(output){
              var tmp= JSON.parse(output)
              if(tmp[0].State==0)
              {
                  console.log("");
                  console.log("ShowGeoMessage/IsOfferValid - UserId: "+UserId +" - ClientId: " +ClientId +" - LocationId: " +LocationId +" - OfferId: " +OfferId +" - Status: " +tmp[0].State +" - Offer: Redeemed/Inactive/Doesn't Exist");
                  console.log("");
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode=406
                  res.write(output);
                  res.end();
              }
              else
              {
                  console.log("");
                  console.log("ShowGeoMessage/IsOfferValid - UserId: " +UserId +" - ClientId: " +ClientId +" - LocationId: " +LocationId +" - OfferId: " +OfferId +" - Status: " +tmp[0].State)
                  console.log("");

                  res.setHeader('Content-Type', 'application/json');
                  res.write(output);
                  res.end();
              }
            });
          }
        });
      }
    }
}

exports.AppEvent = function AppEvent(req,res){

    var UserId=req.params.UserId
    if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
    {
      console.log("");
      console.log("ERROR - UserId can't be NULL or Undefined");
      console.log("");

      res.setHeader('Content-Type', 'application/json');
      res.statusCode=406
      var msj=  [{
                  "State": "UserId can't be NULL or Undefined"
                }]
      var response= JSON.stringify(msj)
      res.write(response);
      res.end();
    }
    else
    {

      var Event=req.body.event
      var Latitude=req.body.latitude
      var Longitude=req.body.longitude

      if(Event=="OpenedApp" || Event == "ClosedApp")
      {

        console.log("");
        console.log("AppEvent - UserId: " +UserId)
        console.log("Event: " +Event)
        console.log("Latitude: " +Latitude)
        console.log("Longitude: " +Longitude)
        console.log("");

        DAL.UpdateAppEvents(req.db,UserId,null,Event,Latitude,Longitude);

        res.end("Success")
      }
      else
      {
        console.log("");
        console.log("ERROR - Wrong AppEvent - UserId: " +UserId +" - Event: " +Event)
        console.log("");

        res.setHeader('Content-Type', 'application/json');
        res.statusCode=406
        var msj=  [{
                    "State": "ERROR - Wrong AppEvent - UserId: " +UserId +" - Event: " +Event
                  }]
        var response= JSON.stringify(msj)
        res.write(response);
        res.end();
      }   
    }
}
