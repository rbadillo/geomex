var DAL= require('./Database');
var moment = require('moment');
var http= require('http');

exports.Test = function Test(req,res){
	res.end('Register Server - OK');
}

exports.Register = function Register(req,res){
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

    try
    {
	   UserId= req.body.id;
    } catch (e){
        UserId= null;
    }

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

        try
        {
    	   DeviceToken=req.body.device_token
        }catch(e)
        {
            DeviceToken=null;
        }

        try
        {
            PhoneType=req.body.phone_type
        }catch(e)
        {
            PhoneType=null;
        }

        try
        {
            Timezone=req.body.timezone
        }catch(e)
        {
            Timezone=null;
        }

        try
        {
            Event=req.body.event
        }catch(e)
        {
            Event= null;
        }

        try
        {
            FbName=req.body.first_name
        }catch(e)
        {
            FbName=null;
        }

        try
        {
            FbLastName=req.body.last_name
        }catch(e)
        {
            FbLastName=null;
        }

        try
        {
            FbBirthday=req.body.birthday
            var User_Age=FbBirthday.split("/")
            var User_Birthday=moment.utc([User_Age[2],User_Age[0]-1,User_Age[1]]) 
            var now= moment.utc()
            FbAge=now.diff(User_Birthday, 'years')
        }catch(e)
        {
            FbBirthday=null;
            FbAge=null;
        }

        try
        {
            FbEmail=req.body.email
        }catch(e)
        {
            FbEmail=null;
        }

        try
        {
            FbGender=req.body.gender
        }catch(e)
        {
            FbGender=null;
        }

        try
        {
            FbSchool=req.body.education
            FbSchool=FbSchool[FbSchool.length-1].school.name
        }catch(e)
        {
            FbSchool=null;
        }

        try
        {
            FbWork=req.body.work[0].employer.name
        }catch(e)
        {
            FbWork=null;
        }

        try
        {
            FbLink=req.body.link
        }catch(e)
        {
            FbLink=null;
        }

        try
        {
            FbPhoto="https://graph.facebook.com/"+UserId+"/picture?width=128&height=128"
        }catch(e)
        {
            FbPhoto=null;
        }

        try
        {
            Latitude=req.body.latitude
        }catch(e)
        {
            Latitude=null;
        }

        try
        {
            Longitude=req.body.longitude 
        }catch(e)
        {
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

        DAL.AddUser(req.db,UserId,DeviceToken,PhoneType,Timezone,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink,FbPhoto,Latitude,Longitude,function(err){
            if(err)
            {
                console.log("");
                console.log("ERROR - Adding/Updating User");
                console.log("");

                res.setHeader('Content-Type', 'application/json');
                res.statusCode=406
                var msj=  [{
                            "State": "ERROR - Adding/Updating User"
                          }]
                var response= JSON.stringify(msj)
                res.write(response);
                res.end();
            }
            else
            {
                res.end('Success');    
            }
        });
    }
   
}

exports.GeoEvent = function Register(req,res){
    
    //console.log(req.body);
    var UserId;
    var LocationId;
    var Event;
    var Latitude;
    var Longitude;

    try
    {
        UserId= req.body.id;
    }catch (e)
    {
        UserId= null;
    }

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

        try
        {
            LocationId=req.body.location_id
        }catch(e)
        {
            LocationId=null;
        }

        try
        {
            Event=req.body.event
            Event=Event.toLowerCase();
        }catch(e)
        {
            Event= null;
        }

        if(LocationId == null ||  LocationId == undefined || Event == null ||  Event == undefined )
        {
          console.log("");
          console.log("ERROR - LocationId/Event can't be NULL or Undefined");
          console.log("");

          res.setHeader('Content-Type', 'application/json');
          res.statusCode=406
          var msj=  [{
                      "State": "LocationId/Event can't be NULL or Undefined"
                    }]
          var response= JSON.stringify(msj)
          res.write(response);
          res.end();
        }
        else
        {
            try
            {
                Latitude=req.body.latitude
            }catch(e)
            {
                Latitude=null;
            }

            try
            {
                Longitude=req.body.longitude 
            }catch(e)
            {
                Longitude=null;
            }

            console.log("");
            console.log("UserId: " +UserId);
            console.log("LocationId: " +LocationId);
            console.log("Event: " +Event);
            console.log("Latitude: " + Latitude);
            console.log("Longitude: " + Longitude);
            console.log("");

            if(Event=="at" || Event=="left")
            {
                DAL.GeoEvent(req.db,UserId,LocationId,Event,Latitude,Longitude,function(err){
                    if(err)
                    {
                        console.log("");
                        console.log("ERROR - Adding GeoEvent");
                        console.log("");

                        res.setHeader('Content-Type', 'application/json');
                        res.statusCode=406
                        var msj=  [{
                                    "State": "ERROR - Adding GeoEvent"
                                  }]
                        var response= JSON.stringify(msj)
                        res.write(response);
                        res.end();
                    }
                    else
                    {
                        res.end('Success');    
                    }
                })
            }
            else
            {
                console.log("");
                console.log("ERROR - Wrong Event: " +Event +" - UserId: " +UserId +" - LocationId: " +LocationId)
                console.log("")

                res.setHeader('Content-Type', 'application/json');
                res.statusCode=406
                var msj=    [{
                            "State": "ERROR - Wrong Event: " +Event +" - UserId: " +UserId +" - LocationId: " +LocationId
                            }]
                var response= JSON.stringify(msj)
                res.write(response);
                res.end();
            }
        }
    }
    
}