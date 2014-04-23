var DAL= require('./Database');
var moment = require('moment');

exports.Test = function Test(req,res){
	res.end('Feature Server - OK');
}

exports.GetAllActiveClients = function GetAllActiveClients(req,res){

    var UserId=req.params.UserId

    DAL.GetAllActiveClients(function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("");
      console.log("GetAllActiveClients - UserId: " +UserId)
      console.log("");
    });    
}

exports.GetClosestLocations = function GetClosestLocations(req,res){

    var UserId=req.params.UserId
    var Latitude=req.params.Latitude
    var Longitude=req.params.Longitude
    var Radius= req.query.radius

    if(Radius==undefined){
      Radius=50;
    }else{
      
      Radius=parseInt(Radius)

      if(isNaN(Radius)){
        Radius=50;
      }
    }

    DAL.GetClosestLocations(Latitude,Longitude,Radius,function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("");
      console.log("GetClosestLocations - UserId: " +UserId +" - Latitude: " +Latitude +" - Longitude: " +Longitude +" - Radius: " +Radius +" Km")
      console.log("");
    });    
}


exports.GetFriends = function GetFriends(req,res){

    var UserId=req.params.UserId
    var FriendList=req.body.friend_list

    DAL.GetFriends(FriendList, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("");
      console.log("GetFriendsPlaces - UserId: " +UserId)
      console.log("Friend Ids: " +FriendList)
      console.log("");
    });    
}


exports.GetFriendActivity = function GetFriendActivity(req,res){

    var UserId=req.params.UserId
    var FriendId=req.params.FriendId

    DAL.GetFriendActivity(FriendId,function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("");
      console.log("GetFriendActivity - UserId: " +UserId +" - FriendId: " +FriendId)
      console.log("");
    });    
}

exports.IsLocationActive= function IsLocationActive(req,res){

    var UserId=req.params.UserId
    var LocationId=req.params.LocationId

    DAL.IsLocationActive(LocationId, function (output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp[0].State=="Error"){
        res.statusCode=404
      }
      res.write(output);
      res.end();
      console.log("");
      console.log("IsLocationActive - UserId: " +UserId +" - LocationId: " +LocationId +" - Active State: " +tmp[0].State)
      console.log("");
    });

}

exports.GetUnreadMessages= function GetUnreadMessages(req,res){

    var UserId=req.params.UserId
    var Timezone=req.params.Timezone
    var LocalTime= moment.utc().zone(Timezone);
    var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
    var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

    DAL.GetOffersId(LocalToUtc,UserId,Timezone, function (output){
          var OfferIds=[]
          var tmp=JSON.parse(output);
          for(var i=0;i<tmp.length;i++){
            OfferIds.push(tmp[i].OfferId);
          }

          DAL.UnreadMessagesNumber(UserId,OfferIds,function(output){
            var tmp=JSON.parse(output);

            res.setHeader('Content-Type', 'application/json');
            res.write(output);
            res.end();

            console.log("");
            console.log("GetUnreadMessages - UserId: " +UserId +" - UnreadMessages: " +tmp[0].State)
            console.log("");

          })
      });
}

exports.GetMessages= function GetMessages(req,res){

    var UserId=req.params.UserId
    var Timezone=req.params.Timezone
    var LocalTime= moment.utc().zone(Timezone);
    var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
    var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

    DAL.GetOffersId(LocalToUtc,UserId,Timezone, function (output){
          var OfferIds=[]
          var tmp=JSON.parse(output);
          for(var i=0;i<tmp.length;i++){
            OfferIds.push(tmp[i].OfferId);
          }

          DAL.GetMessages(UserId,OfferIds,function(output){

            res.setHeader('Content-Type', 'application/json');
            res.write(output);
            res.end();

            console.log("");
            console.log("GetMessages - UserId: " +UserId)
            console.log("");

          })
      });
}


exports.ReadMessage= function ReadMessage(req,res){

    var UserId=req.params.UserId
    var MessageId=req.params.MessageId

    DAL.ReadMessage(UserId,MessageId, function (output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("");
      console.log("ReadMessage - UserId: " +UserId +" - MessageId: " +MessageId +" - Status: " +tmp[0].State)
      console.log("");
    });
}


exports.ShowGeoMessage= function ShowGeoMessage(req,res){

    var UserId=req.params.UserId
    var ClientId=req.params.ClientId
    var LocationId=req.params.LocationId
    var OfferId=req.params.OfferId
    var Timezone=req.params.Timezone
    var LocalTime= moment.utc().zone(Timezone);
    var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
    var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

    DAL.ShowGeoMessage(LocationId, function (output){
      var tmp= JSON.parse(output)
      if(tmp[0].State=="Error"){
        res.statusCode=404
        res.setHeader('Content-Type', 'application/json');
        res.write(output);
        res.end();
        console.log("");
        console.log("ERROR - ShowGeoMessage - UserId: " +UserId +" - LocationId: " +LocationId +" - Status: " +tmp[0].State)
        console.log("");
    }else if(tmp[0].State==0){
        res.setHeader('Content-Type', 'application/json');
        res.write(output);
        res.end();
        console.log("");
        console.log("ShowGeoMessage - UserId: " +UserId +" - LocationId: " +LocationId +" - Status: " +tmp[0].State)
        console.log("");
    }else{

        DAL.IsOfferValid(UserId,OfferId,ClientId,LocalToUtc,function(output){
        var tmp= JSON.parse(output)
        if(tmp[0].State==0){
            res.setHeader('Content-Type', 'application/json');
            res.statusCode=406
            res.write(output);
            res.end();
            console.log("");
            console.log("ShowGeoMessage/IsOfferValid - UserId: "+UserId +" - LocationId: " +LocationId +" - OfferId: " +OfferId +" - Status: " +tmp[0].State +" - Offer: Redeemed/Inactive/Doesn't Exist");
            console.log("");
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.write(output);
            res.end();
            console.log("");
            console.log("ShowGeoMessage/IsOfferValid - UserId: " +UserId +" - LocationId: " +LocationId +" - OfferId: " +OfferId +" - Status: " +tmp[0].State)
            console.log("");
          }
      });
    }
  });
}