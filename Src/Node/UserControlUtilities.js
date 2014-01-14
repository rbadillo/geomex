var DAL= require('./Database');
var moment = require('moment');
var RedisUtilities=require('./RedisUtilities');

exports.Test = function Test(req,res){
	res.end('User Control Server - OK');
}

exports.GetUsersByLocationId = function GetUsersByLocationId(req,res){
    var LocationId=req.params.LocationId
    RedisUtilities.GetUsersByLocationId(LocationId, function(output){
        // do something with output
        //console.log("GetUsersByLocationId");
        //console.log(output);
        //console.log(JSON.parse(Users));
        res.setHeader('Content-Type', 'application/json');
        res.write(output);
        res.end();
        console.log("Getting Users - LocationId: " +LocationId);
        console.log("");
    });
}

exports.AddUserToLocation = function AddUserToLocation(req,res){
    res.end('Success');
    var DeviceToken=req.body.device_token
    var PhoneType=req.body.phone_type
    var LocationId=req.body.location_id
    RedisUtilities.AddUserToLocation(LocationId,PhoneType,DeviceToken);
}

exports.RemoveUserFromLocation = function RemoveUserFromLocation(req,res){
    res.end('Success');
    var DeviceToken=req.body.device_token
    var PhoneType=req.body.phone_type
    var LocationId=req.body.location_id
    RedisUtilities.RemoveUserFromLocation(LocationId,PhoneType,DeviceToken);
}