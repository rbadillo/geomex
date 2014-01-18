var DAL= require('./Database');
var moment = require('moment');

exports.Test = function Test(req,res){
	res.end('Feature Server - OK');
}

exports.GetMessagesSentByClient = function GetMessagesSentByClient(req,res){

    var UserId=req.params.UserId
    var ClientId=req.params.ClientId

    DAL.GetMessagesSentByClient(ClientId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("GetMessagesSentByClient - UserId: " +UserId +" - ClientId: " +ClientId)
      console.log("");
    });    
}

exports.GetMessagesReceivedByUser = function GetMessagesReceivedByUser(req,res){

    var UserId=req.params.UserId

    DAL.GetMessagesReceivedByUser(UserId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("GetMessagesReceivedByUser - UserId: " +UserId)
      console.log("");
    });    
}

exports.GetLocationsByUser = function GetLocationsByUser(req,res){

    var UserId=req.params.UserId
    var UserLocation=req.params.UserLocation

    DAL.GetLocationsByUser(UserLocation, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("GetLocationsByUser - UserId: " +UserId +" - LocationsForUserId: " +UserLocation)
      console.log("");
    });    
}

exports.GetFriendsPlaces = function GetFriendsPlaces(req,res){

    var UserId=req.params.UserId
    var FriendList=req.body.friend_list

    DAL.GetFriendsPlaces(FriendList, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("GetFriendsPlaces - UserId: " +UserId)
      console.log("Friend Ids: " +FriendList)
      console.log("");
    });    
}

exports.GetAllClients = function GetAllClients(req,res){

    var UserId=req.params.UserId

    DAL.GetAllClients(function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("GetAllClients - UserId: " +UserId)
      console.log("");
    });    
}

exports.GetClientLocations = function GetClientLocations(req,res){

    var UserId=req.params.UserId
    var ClientId=req.params.ClientId

    DAL.GetClientLocations(ClientId,function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
      console.log("GetClientLocations - UserId: " +UserId +" - ClientId: " +ClientId)
      console.log("");
    });    
}


exports.GetUserActiveState= function GetUserActiveState(req,res){

    var UserId=req.params.UserId

    DAL.GetUserActiveState(UserId, function (output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp[0].State=="Error"){
        res.statusCode=404
      }
      res.write(output);
      res.end();
      console.log("GetUserActiveState - UserId: " +UserId +" - Actual State: " +tmp[0].State)
      console.log("");
    });

}


exports.UpdateUserActiveState= function UpdateUserActiveState(req,res){

    var UserId=req.params.UserId

    DAL.UpdateUserActiveState(UserId, function (output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp[0].State=="Error"){
        res.statusCode=404
      }
      res.write(output);
      res.end();
      console.log("UpdateUserActiveState - UserId: " +UserId +" - State: " +tmp[0].State)
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
      console.log("IsLocationActive - UserId: " +UserId +" - LocationId: " +LocationId +" - Active State: " +tmp[0].State)
      console.log("");
    });

}