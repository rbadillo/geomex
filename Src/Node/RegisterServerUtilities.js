var DAL= require('./Database');
var moment = require('moment');
var http= require('http');

exports.Test = function Test(req,res){
	res.end('Register Server - OK');
}

exports.Register = function Register(req,res){
	  res.end('Success');
	  //console.log(req.body);

    try{
	  var UserId= req.body.id;
    } catch (e){
    var UserId=""  
    }

    try{
	  var DeviceToken=req.body.device_token
    }catch(e){
    var DeviceToken=""  
    }

    try{
    var PhoneType=req.body.phone_type
    }catch(e){
    var PhoneType=""  
    }

    try{
    var LocationId=req.body.location_id
    }catch(e){
    var LocationId=""
    }

    try{
    var Event=req.body.event
    }catch(e){
    var Event=""
    }

    try{
    var FbName=req.body.first_name
    }catch(e){
    var FbName=""
    }

    try{
    var FbLastName=req.body.last_name
    }catch(e){
    var FbLastName=""
    }

    try{
    var FbBirthday=req.body.birthday
    var User_Age=FbBirthday.split("/")
    var User_Birthday=moment.utc([User_Age[2],User_Age[0]-1,User_Age[1]]) 
    var now= moment.utc()
    var FbAge=now.diff(User_Birthday, 'years')
    }catch(e){
    var FbBirthday=""
    var FbAge=""  
    }

    try{
    var FbEmail=req.body.email
    }catch(e){
    var FbEmail=""
    }

    try{
    var FbGender=req.body.gender
    }catch(e){
    var FbGender=""
    }

    try{
    var FbSchool=req.body.education
    FbSchool=FbSchool[FbSchool.length-1].school.name
    }catch(e){
    var FbSchool=""
    }

    try{
    var FbWork=req.body.work[0].employer.name
    }catch(e){
    var FbWork=""
    }

    try{
    var FbLink=req.body.link
    }catch(e){
    var FbLink=""
    }

    try{
    var FbPhoto="https://graph.facebook.com/"+UserId+"/picture?width=128&height=128"
    }catch(e){
    var FbPhoto=""
    }

    try{
    var Latitude=req.body.latitude
    }catch(e){
    var Latitude=""
    }

    try{
    var Longitude=req.body.longitude 
    }catch(e){
    var Longitude=""
    }
    
    DAL.AddUser(UserId,DeviceToken,PhoneType,LocationId,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink,FbPhoto,Latitude,Longitude);
   
    if(Event=="at"){
          PostUserControl(LocationId,PhoneType,DeviceToken,"/AddUserToLocation")
    }else if (Event=="left"){
          PostUserControl(LocationId,PhoneType,DeviceToken,"/RemoveUserFromLocation")
    }else if(Event=="OpenedApp"){
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
          console.log('User Control: ' +Response);
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