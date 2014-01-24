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
    var LocationId;
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
    console.log("LocationId: " +LocationId);
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


    
    DAL.AddUser(UserId,DeviceToken,PhoneType,LocationId,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink,FbPhoto,Latitude,Longitude);
   
    if(Event=="at"){
          PostUserControl(LocationId,PhoneType,DeviceToken,"/AddUserToLocation")
    }else if (Event=="left"){
          PostUserControl(LocationId,PhoneType,DeviceToken,"/RemoveUserFromLocation")
    }else if(Event=="openedapp"){
          DAL.UpdateAppEvents(UserId,Event,Latitude,Longitude);
    }
    
}

function PostUserControl(LocationId,PhoneType,DeviceToken,Path) {
  // Build the post string from an object
  var User={
    "location_id" : LocationId,
    "phone_type" : PhoneType,
    "device_token" : DeviceToken
  }

  var post_data = tryParseJson(User);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '9000',
      path: Path,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      var Response="";
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          Response= Response + chunk;
      });

      res.on('error', function(e){
          console.log(e)
      });

      res.on('end', function(){
          //console.log('User Control Response: ' +Response);
      });

  });

  // post the data
  post_req.write(post_data);
  post_req.end();

  // Handle Error If User Control Server is Down
  post_req.on('error', function(e){
          console.log("User Control Server - Not Available - " +Date())
  });

}

function tryParseJson(str) {
    try {
        return JSON.stringify(str);
    } catch (ex) {
        return null;
    }
}