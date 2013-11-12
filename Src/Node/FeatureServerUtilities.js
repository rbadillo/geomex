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
    });    
}

exports.GetMessagesReceivedByUser = function GetMessagesReceivedByUser(req,res){

    var UserId=req.params.UserId
    var ClientId=req.params.ClientId

    DAL.GetMessagesReceivedByUser(UserId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.GetLocationsByUser = function GetLocationsByUser(req,res){

    var UserId=req.params.UserId
    var ClientId=req.params.ClientId
    var UserLocation=req.params.UserLocation

    DAL.GetLocationsByUser(UserLocation, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

