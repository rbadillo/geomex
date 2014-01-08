var DAL= require('./Database');
var moment = require('moment');

exports.Test = function Test(req,res){
	res.end('Feature Server - OK');
}

exports.GetMessagesSentByClient = function GetMessagesSentByClient(req,res){

    var ClientId=req.params.ClientId

    DAL.GetMessagesSentByClient(ClientId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.GetMessagesReceivedByUser = function GetMessagesReceivedByUser(req,res){

    var UserId=req.params.UserId

    DAL.GetMessagesReceivedByUser(UserId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.GetLocationsByUser = function GetLocationsByUser(req,res){

    var UserLocation=req.params.UserLocation

    DAL.GetLocationsByUser(UserLocation, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.GetFriendsPlaces = function GetFriendsPlaces(req,res){

    var FriendList=req.body.friend_list

    DAL.GetFriendsPlaces(FriendList, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.GetAllClients = function GetAllClients(req,res){

    DAL.GetAllClients(function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.GetClientLocations = function GetClientLocations(req,res){

    var ClientId=req.params.ClientId

    DAL.GetClientLocations(ClientId,function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}


exports.GetUserActiveState= function GetUserActiveState(req,res){

    var UserId=req.params.UserId

    DAL.GetUserActiveState(UserId, function (output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp.State=="Error"){
        res.statusCode=404
      }
      res.write(output);
      res.end();
    });

}


exports.UpdateUserActiveState= function UpdateUserActiveState(req,res){

    var UserId=req.params.UserId

    DAL.UpdateUserActiveState(UserId, function (output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp.State=="Error"){
        res.statusCode=404
      }
      res.write(output);
      res.end();
    });

}

exports.AppEvents= function AppEvents(req,res){

      res.end('Success');

      var UserId=req.params.UserId
      var Event=req.body.event

      DAL.UpdateAppEvents(UserId,Event);
}