var DAL= require('./Database');
var moment = require('moment');
var http= require('http');

exports.Test = function Test(req,res){
	res.end('Register Server - OK');
}

exports.Register = function Register(req,res){
	  res.end('Success');
	  //console.log(req.body);
    var UserId;
    var DeviceToken;
    var PhoneType;
    var Timezone;
    var Event;
    var FbName;
    var FbLastName;
    var FbBirthday;
    var FbAge;
    var FbEmail;
    var FbGender;
    var FbSchool;
    var FbWork;
    var FbLink;
    var FbPhoto;
    var Latitude;
    var Longitude;

    try{
	UserId= req.body.id;
    } catch (e){
    UserId= null;
    }

    try{
	DeviceToken=req.body.device_token
    }catch(e){
    DeviceToken=null;
    }

    try{
    PhoneType=req.body.phone_type
    }catch(e){
    PhoneType=null;
    }

    try{
    Timezone=req.body.timezone
    }catch(e){
    Timezone=null;
    }

    try{
    Event=req.body.event
    }catch(e){
    Event= null;
    }

    try{
    FbName=req.body.first_name
    }catch(e){
    FbName=null;
    }

    try{
    FbLastName=req.body.last_name
    }catch(e){
    FbLastName=null;
    }

    try{
    FbBirthday=req.body.birthday
    var User_Age=FbBirthday.split("/")
    var User_Birthday=moment.utc([User_Age[2],User_Age[0]-1,User_Age[1]]) 
    var now= moment.utc()
    FbAge=now.diff(User_Birthday, 'years')
    }catch(e){
    FbBirthday=null;
    FbAge=null;
    }

    try{
    FbEmail=req.body.email
    }catch(e){
    FbEmail=null;
    }

    try{
    FbGender=req.body.gender
    }catch(e){
    FbGender=null;
    }

    try{
    FbSchool=req.body.education
    FbSchool=FbSchool[FbSchool.length-1].school.name
    }catch(e){
    FbSchool=null;
    }

    try{
    FbWork=req.body.work[0].employer.name
    }catch(e){
    FbWork=null;
    }

    try{
    FbLink=req.body.link
    }catch(e){
    FbLink=null;
    }

    try{
    FbPhoto="https://graph.facebook.com/"+UserId+"/picture?width=128&height=128"
    }catch(e){
    FbPhoto=null;
    }

    try{
    Latitude=req.body.latitude
    }catch(e){
    Latitude=null;
    }

    try{
    Longitude=req.body.longitude 
    }catch(e){
    Longitude=null;
    }

    console.log("");
    console.log("UserId: " +UserId);
    console.log("DeviceToken: " +DeviceToken);
    console.log("PhoneType: " +PhoneType);
    console.log("Timezone: " +Timezone);
    console.log("Event: " +Event);
    console.log("FbName: " +FbName);
    console.log("FbLastName: " +FbLastName);
    console.log("FbBirthday: " + FbBirthday);
    console.log("FbAge: " +FbAge);
    console.log("FbEmail: " +FbEmail);
    console.log("FbGender: " +FbGender);
    console.log("FbSchool: " + FbSchool);
    console.log("FbWork: " + FbWork);
    console.log("FbLink: " + FbLink);
    console.log("FbPhoto: " + FbPhoto);
    console.log("Latitude: " + Latitude);
    console.log("Longitude: " + Longitude);
    console.log("");

    DAL.AddUser(UserId,DeviceToken,PhoneType,Timezone,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink,FbPhoto,Latitude,Longitude);
   
}

exports.GeoEvent = function Register(req,res){
    res.end('Success');
    //console.log(req.body);
    var UserId;
    var LocationId;
    var Event;
    var Latitude;
    var Longitude;

    try{
    UserId= req.body.id;
    } catch (e){
    UserId= null;
    }

    try{
    LocationId=req.body.location_id
    }catch(e){
    LocationId=null;
    }

    try{
    Event=req.body.event
    Event=Event.toLowerCase();
    }catch(e){
    Event= null;
    }

    try{
    Latitude=req.body.latitude
    }catch(e){
    Latitude=null;
    }

    try{
    Longitude=req.body.longitude 
    }catch(e){
    Longitude=null;
    }

    console.log("");
    console.log("UserId: " +UserId);
    console.log("LocationId: " +LocationId);
    console.log("Event: " +Event);
    console.log("Latitude: " + Latitude);
    console.log("Longitude: " + Longitude);
    console.log("");

    if(Event=="at" || Event=="left"){
    DAL.GeoEvent(UserId,LocationId,Event,Latitude,Longitude)
    }else{
      console.log("");
      console.log("ERROR - Wrong Event: " +Event +" - UserId: " +UserId +" - LocationId: " +LocationId)
      console.log("")
    }
    
}