var orm = require("orm");
var moment = require('moment');
var https= require('https');

//exports.AddClient = function AddClient
exports.AddClient = function AddClient(Name){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var cliente = db.models.Clients;

                    cliente.find({ Name:Name },function (err, clnt) {
                      if(err){
                        console.log(err);
                      }else{
                        if(clnt.length){
                            console.log("Existing Client");
                          }else{
                            var cliente = db.models.Clients();
                            cliente.Name=Name
                            
                            cliente.save(function (err) {
                                 if (err){
                                    console.log(err);
                                 }else{
                                 console.log("Client Added Sucessfully");
                                 }
                             });
                          }
                      }
                    });
            });
        });
}

//exports.AddLocation = function AddLocation
exports.AddLocation = function AddLocation(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var location = db.models.Locations;

                    location.find({Name:Name, ClientId: ClientId, Latitude: Latitude, Longitude: Longitude,Address:Address,
                    Country:Country, State:State, City:City, ZipCode:ZipCode },function (err, loc) {

                      if(err){
                        console.log(err);
                      }else{
                        if(loc.length){
                            console.log("Existing Location");
                          }else{
                            var location = db.models.Locations();
                            location.Name=Name
                            location.ClientId=ClientId
                            location.Latitude=Latitude
                            location.Longitude=Longitude
                            location.Address=Address
                            location.Country=Country
                            location.State=State
                            location.City=City
                            location.ZipCode=ZipCode
                            
                            location.save(function (err) {
                                 if (err){
                                    console.log(err);
                                 }else{
                                 console.log("Location Added Sucessfully");
                                 GetLocationId(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode);
                                 }
                             });
                          }
                      }
                    });
            });
        });
}

function GetLocationId(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var location = db.models.Locations;

                    location.find({Name:Name, ClientId:ClientId, Latitude:Latitude, Longitude:Longitude,Address:Address,
                    Country:Country, State:State, City:City, ZipCode:ZipCode },function (err, loc) {

                      if(err){
                        console.log(err);
                      }else{
                        console.log("Id: " +loc[0].LocationId);
                        PostGimbal(Name,Address,Latitude,Longitude,loc[0].LocationId);
                      }
                    });
            });
        });
}

exports.AddMessage = function AddMessage(Message,LocationId,ClientId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var message = db.models.Messages;

                    message.find({Message: Message, LocationId: LocationId, ClientId: ClientId},function (err, msj) {

                      if(err){
                          console.log(err);
                      }else{
                          if(msj.length){
                            console.log("Existing Message");
                            callback();
                          }else{
                            var msj = db.models.Messages();
                            msj.Message=Message
                            msj.LocationId=LocationId
                            msj.ClientId=ClientId
                            msj.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                            
                            msj.save(function (err) {
                                     if (err){
                                        console.log(err);
                                     }else{
                                     console.log("Message Added Sucessfully");
                                     callback();
                                     }
                                 });
                          }
                      }

                    });
            });
        });
}


exports.AddUser = function AddUser(UserId,DeviceToken,PhoneType,LocationId,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var User= db.models.Users;

                    User.get(UserId,function (err, usr) {
                        if(err){
                            console.log("New User");

                            var usr = db.models.Users();
                            usr.UserId=UserId
                            usr.DeviceToken=DeviceToken
                            usr.PhoneType=PhoneType
                            usr.LocationId=LocationId
                            usr.Event=Event
                            usr.FbName=FbName
                            usr.FbLastName=FbLastName
                            usr.FbAge=FbAge
                            usr.FbBirthday=FbBirthday
                            usr.FbEmail=FbEmail
                            usr.FbGender=FbGender
                            usr.FbSchool=FbSchool
                            usr.FbWork=FbWork
                            usr.FbLink=FbLink

                            usr.save(function (err) {
                                 if (err){
                                    console.log(err);
                                 }else{
                                 console.log("User Added Sucessfully");
                                 }
                             });
                            
                        }else{
                            console.log("User Exist");
                            
                            usr.UserId=UserId
                            usr.DeviceToken=DeviceToken
                            usr.PhoneType=PhoneType
                            usr.LocationId=LocationId
                            usr.Event=Event
                            usr.FbName=FbName
                            usr.FbLastName=FbLastName
                            usr.FbAge=FbAge
                            usr.FbBirthday=FbBirthday
                            usr.FbEmail=FbEmail
                            usr.FbGender=FbGender
                            usr.FbSchool=FbSchool
                            usr.FbWork=FbWork
                            usr.FbLink=FbLink

                            
                            usr.save(function (err) {
                                 if (err){
                                    console.log(err);
                                 }else{
                                 console.log("User Updated Sucessfully");
                                 }
                             });
                          }
                    });
            });
        });
}


function AddSentMessage(UserId,MessageId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var SentMessage = db.models.SentMessages();
                    SentMessage.UserId=UserId
                    SentMessage.MessageId=MessageId
                    SentMessage.TimeSent=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                    
                    SentMessage.save(function (err) {
                         if (err){
                            console.log(err);
                         }else{
                         console.log("SentMessage Added Sucessfully");
                         }
                     });

            });
        });
}


function DeleteSentMessage(UserId,MessageId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var SentMessage = db.models.SentMessages;
                    
                    SentMessage.find({ UserId: UserId, MessageId: MessageId }).remove(function (err) {
                        if(err){
                            console.log(err);
                        }else{
                            console.log("SentMessage Deleted Sucessfully");
                        }
                    });
                });
            });
    }


function GetMessageId(UserId,Message,Action){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Msj = db.models.Messages;
                    
                    Msj.find({ Message: Message}, function (err,msj) {
                        if(err){
                            console.log(err);
                        }else{
                            //console.log(msj[0].MessageId);
                            if(Action=="Add"){
                              AddSentMessage(UserId,msj[0].MessageId);
                            }else if (Action=="Delete"){
                               DeleteSentMessage(UserId,msj[0].MessageId);
                            }   
                        }
                    });
                });
            });
    }


//GetUserId
exports.UpdateSentMessage = function UpdateSentMessage(DeviceToken,Message,Action){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var User = db.models.Users;
                    
                    User.find({ DeviceToken: DeviceToken}, function (err,usr) {
                        if(err){
                            console.log(err);
                        }else{
                            //console.log(usr[0].UserId);
                            GetMessageId(usr[0].UserId,Message,Action);
                        }
                    });
                });
            });
    }


function PostGimbal(Name,Address,Latitude,Longitude,LocationId) {
  // Build the post string from an object
  var Place= {
        "name": Name,
        "addressLineOne": Address,
        "geoFenceCircle": {
            "radius": 50,
            "location": {
                "latitude": Latitude,
                "longitude": Longitude
            }
        },
        "placeAttributes": {
            "latitude": Latitude,
            "longitude": Longitude,
            "locationId": LocationId
        }
    }

  var post_data = tryParseJson(Place);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'sandbox.gimbal.com',
      port: '443',
      path: '/api/geofences',
      method: 'POST',
      headers: {
          'AUTHORIZATION': 'Token token=7ec5f434d5ac2f91172bb1a396ebd4c1',
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = https.request(post_options, function(res) {
      var Response="";
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          Response= Response + chunk;
      });

      res.on('end', function(){
          console.log('Gimbal: ' +res.statusCode);
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


//AddClient("Costenito");
//AddLocation(3,25.654269,-100.29393,"Garza Sada Sur 2411","Mexico","Nuevo Leon","Monterrey","64700");
//AddMessage("Hola Mi Cielo",1,3);
//AddUser("517218456","82cf067e172c6babde45e9fb9827a3d025ec797aa00c1e24acaec025cdb5c913","iOS","1","Roberto","Badillo",24,"01/26/1989","beto_best@hotmail.com","male","Monterrey Institute of Technology and Higher Education","Koupon Media","https://www.facebook.com/beto.badillo");
//AddSentMessage(517218456,1);
//AddSentMessage(517218456,2);
//DeleteAddSentMessage(517218456,1);
//AddUser("517218456","82cf067e172c6babde45e9fb9827a3d025ec797aa00c1e24acaec025cdb5c913","iOS","1","Roberto","Badillo",24,"01/26/1989","beto_best@hotmail.com","male","Monterrey Institute of Technology and Higher Education","Koupon Media","https://www.facebook.com/beto.badillo");
//AddUser("762419965","82cf067e17ghdbfueh36485810hyudgj1g3841hfkhgy1e24ajuhi82odkmnhg12","iOS","1","Itzel","Lopez",21,"03/11/1992","itzela911@hotmail.com","female","Monterrey Institute of Technology and Higher Education","ITESM","https://www.facebook.com/itzel.lpz");
//UpdateSentMessage("82cf067e172c6babde45e9fb9827a3d025ec797aa00c1e24acaec025cdb5c913","Hola Mi Cielo",DeleteSentMessage);
//GetMessageId("Hola Mi Cielo");
//PostGimbal("Depa","Mexico","33.12345","-99.23345",5);
//AddLocation("Costenito - San Pedro",3,33.654269,-99.29393,"Ave. San Pedro","Mexico","Nuevo Leon","San Pedro","64700");
//GetLocationId("Costenito - Tec",3,25.654269,-100.29393,"Garza Sada Sur 2411","Mexico","Nuevo Leon","Monterrey","64700");