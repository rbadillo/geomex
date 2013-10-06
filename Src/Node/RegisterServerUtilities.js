var DAL= require('./Database');
var moment = require('moment');
var http= require('http');

exports.Test = function Test(req,res){
	res.end('hello world');
}

exports.Register = function Register(req,res){
	res.end('Success');
	//console.log(req.body);

	var UserId= req.body.id;
	var DeviceToken=req.body.device_token
    var PhoneType=req.body.phone_type
    var LocationId=req.body.location_id
    var FbName=req.body.first_name
    var FbLastName=req.body.last_name
    var FbBirthday=req.body.birthday


    var User_Age=FbBirthday.split("/")
    var User_Birthday=moment.utc([User_Age[2],User_Age[0],User_Age[1]])
    var now= moment.utc()
    var FbAge=now.diff(User_Birthday, 'years')

    
    var FbEmail=req.body.email
    var FbGender=req.body.gender
    var FbSchool=req.body.education
    FbSchool=FbSchool[FbSchool.length-1].school.name
    var FbWork=req.body.work[0].employer.name
    var FbLink=req.body.link

    var Event=req.body.event

    DAL.AddUser(UserId,DeviceToken,PhoneType,LocationId,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink);
    
    if(Event=="left"){
        PostUserControl(LocationId,PhoneType,DeviceToken,"/RemoveUserFromLocation")
    }else{
        PostUserControl(LocationId,PhoneType,DeviceToken,"/AddUserToLocation")
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

      res.on('end', function(){
          console.log('User Control: ' +Response);
      });

  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

function tryParseJson(str) {
    try {
        return JSON.stringify(str);
    } catch (ex) {
        return null;
    }
}