var orm = require("orm");
var moment = require('moment');
var https= require('https');

//exports.AddClient = function AddClient
exports.AddClient = function AddClient(Name,Logo){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var cliente = db.models.Clients;

                    cliente.find({ Name:Name },function (err, clnt) {
                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        if(clnt.length){
                            console.log("Existing Client");
                            db.close();
                          }else{
                            var cliente = db.models.Clients();
                            cliente.Name=Name
                            cliente.Logo=Logo
                            
                            cliente.save(function (err) {
                                 if (err){
                                    console.log(err);
                                    db.close();
                                 }else{
                                 console.log("Client Added Sucessfully");
                                 db.close();
                                 }
                             });
                          }
                      }
                    });
            });
        });
}

//exports.AddLocation = function AddLocation
exports.AddLocation = function AddLocation(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode,OfferId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var location = db.models.Locations;

                    location.find({Name:Name, ClientId: ClientId, Latitude: Latitude, Longitude: Longitude,Address:Address,
                    Country:Country, State:State, City:City, ZipCode:ZipCode },function (err, loc) {

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        if(loc.length){
                            console.log("Existing Location - " +Name);
                            GetLocationId(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode,OfferId);
                            db.close();
                          }else{
                            var location = db.models.Locations();
                            location.Name=Name
                            location.ClientId=ClientId
                            location.IsActive=1
                            location.IsPrivate=0
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
                                    db.close();
                                 }else{
                                 console.log("Location Added Sucessfully - " +Name);
                                 db.close();
                                 GetLocationId(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode,OfferId);
                                 }
                             });
                          }
                      }
                    });
            });
        });
}

function GetLocationId(Name,ClientId,Latitude,Longitude,Address,Country,State,City,ZipCode,OfferId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var location = db.models.Locations;

                    location.find({Name:Name, ClientId:ClientId, Latitude:Latitude, Longitude:Longitude,Address:Address,
                    Country:Country, State:State, City:City, ZipCode:ZipCode },function (err, loc) {

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        //console.log("DB LocationId: " +loc[0].LocationId);
                        db.close();
                        AddGimbalGeofence(Name,Address,Latitude,Longitude,loc[0].LocationId,OfferId,ClientId);
                      }
                    });
            });
        });
}

function GetOfferObject(OfferId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Offers = db.models.Offers;

                    Offers.find({OfferId:OfferId},function (err, offer) {

                      if(err){
                        console.log(err);
                        db.close();
                        callback(null)
                      }else{
                        db.close();
                        callback(offer)
                      }
                    });
            });
        });
}

function GetClientObject(ClientId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Client = db.models.Clients;

                    Client.find({ClientId:ClientId},function (err, client) {

                      if(err){
                        console.log(err);
                        db.close();
                        callback(null)
                      }else{
                        db.close();
                        callback(client)
                      }
                    });
            });
        });
}

function AddGimbalGeofence(Name,Address,Latitude,Longitude,LocationId,OfferId,ClientId) {
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
            "location_id": LocationId
        }
    }

  var post_data = tryParseJson(Place);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'manager.gimbal.com',
      port: '443',
      path: '/api/geofences',
      method: 'POST',
      headers: {
          'AUTHORIZATION': 'Token token=88530dc982fb7b9a5aa1498197b3038f',
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
          if(res.statusCode==200){

            GimbalResponse=JSON.parse(Response)
            GimbalLocationId=GimbalResponse.id

            GetOfferObject(OfferId,function(OfferObject){
              if(OfferObject!=null){
                console.log("SUCCESS - Creating Gimbal Geofence - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - HTTP " +res.statusCode)
                AddGimbalCommunication(Name,OfferObject,ClientId,GimbalLocationId)
              }else{
                console.log("Error - OfferId: " +OfferId +" doesn't exist")
              }

            })

          }else{
            console.log("ERROR - Creating Gimbal Geofence - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - HTTP " +res.statusCode)
          }
      });

  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

function AddGimbalCommunication(Name,OfferObject,ClientId,GimbalLocationId) {
  // Build the post string from an object
  var Communication= {
        "name": "At " +Name,
        "published":true,
        "start_date": moment(OfferObject[0].StartDate).format("YYYY-MM-DD"),
        "end_date": moment(OfferObject[0].EndDate).format("YYYY-MM-DD"),
        "notification": {
            "title": "Near",
            "description": "Near"
        },
        "context_trigger":{
          "geofence":{"event_type":"at","locations":[GimbalLocationId]}
        }
    }

  var post_data = tryParseJson(Communication);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'manager.gimbal.com',
      port: '443',
      path: '/api/communications',
      method: 'POST',
      headers: {
          'AUTHORIZATION': 'Token token=88530dc982fb7b9a5aa1498197b3038f',
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
          if(res.statusCode==200){

            GimbalResponse=JSON.parse(Response)
            GimbalCommunicationId=GimbalResponse.id

            GetClientObject(ClientId,function(ClientObject){
              if(ClientObject!=null){
                console.log("SUCCESS - Creating Gimbal Communication - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - HTTP " +res.statusCode)
                AddGimbalCommunicationAttributes(Name,OfferObject,ClientObject,GimbalLocationId,GimbalCommunicationId)
              }else{
                console.log("ERROR - ClientId: " +ClientId +" doesn't exist")
              }
            })

          }else{
            console.log("ERROR - Creating Gimbal Communication - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - HTTP " +res.statusCode)
          }
      });

  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

function AddGimbalCommunicationAttributes(Name,OfferObject,ClientObject,GimbalLocationId,CommunicationId) {
  // Build the post string from an object
  var Attributes= {
        "communication_attributes": {
          "offer_id": OfferObject[0].OfferId,
          "client_name": ClientObject[0].Name,
          "offer_title": OfferObject[0].Title,
          "offer_subtitle": OfferObject[0].Subtitle,
          "client_logo": ClientObject[0].Logo,
          "client_id": ClientObject[0].ClientId
        }
    }

  var post_data = tryParseJson(Attributes);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'manager.gimbal.com',
      port: '443',
      path: '/api/communications/'+CommunicationId+'/communication_attributes',
      method: 'POST',
      headers: {
          'AUTHORIZATION': 'Token token=88530dc982fb7b9a5aa1498197b3038f',
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
          if(res.statusCode==200){
            console.log("SUCCESS - Adding Communication Attributes - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - CommunicationId: " +CommunicationId +" - HTTP " +res.statusCode)
            PublishGimbalCommunication(Name,GimbalLocationId,CommunicationId)
          }else{
            console.log("ERROR - Adding Communication Attributes - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - CommunicationId: " +CommunicationId +" - HTTP " +res.statusCode)
          }
      });

  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

function PublishGimbalCommunication(Name,GimbalLocationId,CommunitationId) {
  // Build the post string from an object
  var Publish= {}

  var post_data = tryParseJson(Publish);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'manager.gimbal.com',
      port: '443',
      path: '/api/communications/'+CommunitationId+'/publish',
      method: 'POST',
      headers: {
          'AUTHORIZATION': 'Token token=88530dc982fb7b9a5aa1498197b3038f',
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
          if(res.statusCode==200){
            console.log("SUCCESS - Publishing Communication - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - CommunitationId: " +CommunitationId +" - HTTP " +res.statusCode)
          }else{
            console.log("ERROR - Publishing Communication - " +Name +" - GimbalLocationId: " +GimbalLocationId +" - CommunitationId: " +CommunitationId +" - HTTP " +res.statusCode)
          }
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

exports.AddMessage = function AddMessage(Message,OfferId,ClientId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var message = db.models.Messages;

    message.find({Message: Message, OfferId: OfferId, ClientId: ClientId},function (err, msj) {

                      if(err){
                          console.log(err);
                          db.close();
                      }else{
                          if(msj.length){
                            console.log("Existing Message - Message: " +Message +" - ClientId: " +ClientId);
                            db.close();
                            callback();
                          }else{
                            var msj = db.models.Messages();
                            msj.Message=Message
                            msj.OfferId=OfferId
                            msj.ClientId=ClientId
                            msj.IsPrivate=1
                            msj.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                            
                            msj.save(function (err) {
                                     if (err){
                                        console.log(err);
                                        db.close();
                                     }else{
                                     console.log("New Message Added Sucessfully - Message: " +Message +" - ClientId: " +ClientId);
                                     db.close();
                                     callback();
                                     }
                                 });
                          }
                      }

                    });
            });
        });
}


exports.AddUser = function AddUser(UserId,DeviceToken,PhoneType,Timezone,Event,FbName,FbLastName,FbAge,FbBirthday,FbEmail,FbGender,FbSchool,FbWork,FbLink,FbPhoto,Latitude,Longitude){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var User= db.models.Users;

                    User.get(UserId,function (err, usr) {
                        if(err){
                            //console.log("New User - UserId: "+UserId);

                            var usr = db.models.Users();
                            usr.UserId=UserId
                            usr.DeviceToken=DeviceToken
                            usr.PhoneType=PhoneType
                            usr.Timezone=Timezone
                            usr.FbName=FbName
                            usr.FbLastName=FbLastName
                            usr.FbAge=FbAge
                            usr.FbBirthday=FbBirthday
                            usr.FbEmail=FbEmail
                            usr.FbGender=FbGender
                            usr.FbSchool=FbSchool
                            usr.FbWork=FbWork
                            usr.FbLink=FbLink
                            usr.FbPhoto=FbPhoto
                            usr.LastRegister=moment.utc().format("YYYY-MM-DD HH:mm:ss");

                            usr.save(function (err) {
                                 if (err){
                                    console.log(err);
                                    db.close();
                                 }else{
                                 //console.log("User Added Sucessfully - UserId: "+UserId);
                                    db.close();
                                   if(Event=="register"){
                                      UpdateAppEvents(UserId,Event,Latitude,Longitude);
                                  }else{
                                      console.log("ERROR - Wrong Event: " +Event +" - UserId: " +UserId)
                                      console.log("")
                                    }
                                 }
                             });
                            
                        }else{
                            //console.log("Existing User - UserId: "+UserId);
                            
                            usr.UserId=UserId
                            usr.DeviceToken=DeviceToken
                            usr.PhoneType=PhoneType
                            usr.Timezone=Timezone
                            usr.FbName=FbName
                            usr.FbLastName=FbLastName
                            usr.FbAge=FbAge
                            usr.FbBirthday=FbBirthday
                            usr.FbEmail=FbEmail
                            usr.FbGender=FbGender
                            usr.FbSchool=FbSchool
                            usr.FbWork=FbWork
                            usr.FbLink=FbLink
                            usr.FbPhoto=FbPhoto
                            usr.LastRegister=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                            
                            usr.save(function (err) {
                                 if (err){
                                    console.log(err);
                                    db.close();
                                 }else{
                                 //console.log("User Updated Sucessfully - UserId: "+UserId);
                                 db.close();
                                 if(Event !== undefined && Event.toLowerCase()=="register"){
                                    UpdateAppEvents(UserId,Event,Latitude,Longitude);
                                  }else{
                                      console.log("ERROR - Wrong Event: " +Event +" - UserId: " +UserId)
                                      console.log("")
                                    }
                                }
                             });
                          }
                    });
            });
        });
}

exports.GeoEvent = function GeoEvent(UserId,LocationId,Event,Latitude,Longitude){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Local= db.models.Locations;

                    Local.get(LocationId,function (err, loc) {
                        if(err){
                            console.log("Non Existing Location - LocationId: " +LocationId);
                            console.log(err);
                            console.log("");
                            db.close();
                        }else{
                            //console.log("Existing Location - LocationId: " +LocationId);
                            //console.log(loc.ClientId);
                            db.close();
                            UpdateLocationEvents(UserId,loc.ClientId,LocationId,loc.Name,Event,Latitude,Longitude);
                          }
                    });
            });
        });
}

function UpdateLocationEvents(UserId,ClientId,LocationId,LocationName,Event,Latitude,Longitude){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var LocationEventAnalytics = db.models.LocationEvents();
                    LocationEventAnalytics.UserId=UserId
                    LocationEventAnalytics.ClientId=ClientId
                    LocationEventAnalytics.LocationId=LocationId
                    LocationEventAnalytics.LocationName=LocationName
                    LocationEventAnalytics.Event=Event
                    LocationEventAnalytics.Latitude=Latitude
                    LocationEventAnalytics.Longitude=Longitude
                    LocationEventAnalytics.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                    
                    LocationEventAnalytics.save(function (err) {
                         if (err){
                            console.log(err);
                            db.close();
                         }else{
                         //console.log("LocationEvents Updated Sucessfully - Location: " +LocationName +" - Event: " +Event +" - UserId: " +UserId);
                         //console.log("")
                         db.close();
                         }
                     });

            });
        });
}

function UpdateAppEvents(UserId,Event,Latitude,Longitude){

  orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var AppEvent= db.models.AppEvents();
                    AppEvent.UserId=UserId
                    AppEvent.Event=Event
                    AppEvent.Latitude=Latitude
                    AppEvent.Longitude=Longitude
                    AppEvent.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                    
                    AppEvent.save(function (err) {
                         if (err){
                            console.log(err);
                            console.log("");
                            db.close();
                         }else{
                         //console.log("AppEvent Added Sucessfully - UserId: " +UserId);
                         //console.log("");
                         db.close();
                         }
                     });
            });
        });
}


exports.UpdateSentMessageRecursive= function UpdateSentMessageRecursive(DeviceTokens,Index,Message,Action,callback){

  if(Index >= DeviceTokens.length){
      console.log()
      callback();
  }else{
      UpdateSentMessageSerial(DeviceTokens[Index],Message,Action,function(){
          Index=Index+1;
          exports.UpdateSentMessageRecursive(DeviceTokens,Index,Message,Action,callback)
      })
  }
}

//GetUserIdSerial
function UpdateSentMessageSerial(DeviceToken,Message,Action,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    query="Select UserId,DeviceToken,PhoneType from Users where DeviceToken= '" +DeviceToken +"'"

                            db.driver.execQuery(query, function (err, user) { 

                                  if(err){
                                    console.log(err);
                                    db.close();
                                    callback();
                                  }else{
                                    db.close();
                                    GetMessageIdSerial(user[0].UserId,Message,Action,callback);
                                  }

                            })
                });
            });
    }


function GetMessageIdSerial(UserId,Message,Action,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Msj = db.models.Messages;
                    
                    Msj.find({ Message: Message}, function (err,msj) {
                        if(err){
                            console.log(err);
                            db.close();
                            callback();
                        }else{
                            //console.log(msj[0].MessageId);
                            db.close();  
                            if(Action=="Add"){
                              AddSentMessageSerial(UserId,msj[0].MessageId,callback);
                            }else if (Action=="Delete"){
                               DeleteSentMessageSerial(UserId,msj[0].MessageId,callback);
                            }
                             
                        }
                    });
                });
            });
    }


function AddSentMessageSerial(UserId,MessageId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var SentMessage = db.models.SentMessages();
                    SentMessage.UserId=UserId
                    SentMessage.MessageId=MessageId
                    SentMessage.MessageRead=0
                    SentMessage.TimeSent=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                    
                    SentMessage.save(function (err) {
                         if (err){
                            console.log(err);
                            db.close();
                            callback();
                         }else{
                         //console.log("SentMessage Added Sucessfully");
                         db.close();
                         callback();
                         }
                     });
            });
        });
}


function DeleteSentMessageSerial(UserId,MessageId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var SentMessage = db.models.SentMessages;
                    
                    SentMessage.find({ UserId: UserId, MessageId: MessageId }).remove(function (err) {
                        if(err){
                            console.log(err);
                            db.close();
                            callback();
                        }else{
                            //console.log("SentMessage Deleted Sucessfully");
                            db.close();
                            callback();
                        }
                    });
                });
            });
    }


//GetUserId Async
exports.UpdateSentMessage = function UpdateSentMessage(DeviceToken,Message,Action){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    query="Select UserId,DeviceToken,PhoneType from Users where DeviceToken= '" +DeviceToken +"'"

                            db.driver.execQuery(query, function (err, user) { 

                                  if(err){
                                    console.log(err);
                                    db.close();
                                  }else{
                                    db.close();
                                    GetMessageId(user[0].UserId,Message,Action);
                                  }

                            })
                });
            });
    }


function GetMessageId(UserId,Message,Action){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Msj = db.models.Messages;
                    
                    Msj.find({ Message: Message}, function (err,msj) {
                        if(err){
                            console.log(err);
                            db.close();
                        }else{
                            //console.log(msj[0].MessageId);
                            db.close();  
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

function AddSentMessage(UserId,MessageId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var SentMessage = db.models.SentMessages();
                    SentMessage.UserId=UserId
                    SentMessage.MessageId=MessageId
                    SentMessage.MessageRead=0
                    SentMessage.TimeSent=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                    
                    SentMessage.save(function (err) {
                         if (err){
                            console.log(err);
                            db.close();
                         }else{
                         //console.log("SentMessage Added Sucessfully");
                         db.close();
                         }
                     });
            });
        });
}


function DeleteSentMessage(UserId,MessageId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var SentMessage = db.models.SentMessages;
                    
                    SentMessage.find({ UserId: UserId, MessageId: MessageId }).remove(function (err) {
                        if(err){
                            console.log(err);
                            db.close();
                        }else{
                            //console.log("SentMessage Deleted Sucessfully");
                            db.close();
                        }
                    });
                });
            });
    }


exports.GetOffers = function GetOffers(UserTime,UserId,Timezone,ClientId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var offer = db.models.Offers;

                      query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId, \
                            Offers.ClientId,Offers.Name,Offers.Title,Offers.Subtitle, \
                            Offers.Instructions,Offers.Disclaimer, \
                            Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
                            Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
                            Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
                            Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
                            where (Offers.PublishedDate <= '" +UserTime +"' and '" +UserTime +"' <= Offers.EndDate) \
                            and Clients.IsActive=1 and Offers.IsActive=1 \
                            and Clients.ClientId=Offers.ClientId and Offers.ClientId=" +ClientId
                            +" Order by Offers.IsPrivate DESC,Offers.Priority DESC,Offers.EndDate DESC"

                            db.driver.execQuery(query, function (err, offers) { 

                                  if(err){
                                    console.log(err);
                                    db.close();
                                  }else{
                                    db.close();
                                    GetPrivateOffers(UserTime,UserId,offers,Timezone,callback);
                                  }

                            })
            });
        });
}


function GetPrivateOffers(UserTime,UserId,PublicOffers,Timezone,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var privateOffer = db.models.UserPrivateOffers;

                    privateOffer.find( {StartDate:orm.lte(UserTime), EndDate:orm.gte(UserTime), UserId:UserId  },function (err, off) {

                      if(err){
                        console.log("Error")
                        console.log(err);
                        db.close();
                      }else{
                        //console.log(off.length);
                        //for(var i=0;i<off.length;i++){
                            //console.log("Private OfertaId: " +off[i].OfferId +" - UserId: " +off[i].UserId);
                        //}
                        db.close();
                        GetUserRedemption(UserId,PublicOffers,off,Timezone,callback);
                      }
                    });
            });
        });
}


function GetUserRedemption(UserId,PublicOffers,PrivateOffers,Timezone,callback){

        var ofertas=[];

        for(var i=0;i<PublicOffers.length;i++){
          ofertas.push(PublicOffers[i].OfferId)
        }

        var ofertasPrivadas= []

        for(var i=0;i<PrivateOffers.length;i++){
          ofertasPrivadas.push(PrivateOffers[i].OfferId)
        }

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var redemption = db.models.OfferRedemption;

                    redemption.find( {OfferId: ofertas, UserId:UserId},function (err, off) {

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        //console.log(off.length);
                        db.close();
                        var ofertasUsadas=[]
                        for(var i=0;i<off.length;i++){
                          ofertasUsadas.push(off[i].OfferId);
                        }
                        FilterOffers(PublicOffers,ofertasPrivadas,PrivateOffers,ofertasUsadas,Timezone,callback);
                      }
                    });
            });
        });
}


function FilterOffers(PublicOffers,PrivateOffers,PrivateOffersObject,RedemedOffers,Timezone,callback){

var FinalOfferList=[]
var IndexToRemove=[]

// Remove Offers Already Redeemed
  for(var i=0;i<PublicOffers.length;i++){
      for(var j=0;j<RedemedOffers.length;j++){
        if(PublicOffers[i].OfferId==RedemedOffers[j] && PublicOffers[i].MultiUse==0){
          if(IndexToRemove.indexOf(i)==-1){
            IndexToRemove.push(i)
          }
        }
      }
    }

// Remove PrivateOffers Not added to User
    for(var i=0;i<PublicOffers.length;i++){
        var UserPrivateOffer= false;
        if(PublicOffers[i].IsPrivate==1){
          for(var j=0;j<PrivateOffers.length;j++){
            if(PublicOffers[i].OfferId==PrivateOffers[j]){
              UserPrivateOffer=true;
              for(var k=0;k<PrivateOffersObject.length;k++){
                if(PrivateOffers[j]==PrivateOffersObject[k].OfferId){
                  PublicOffers[i].EndDate=PrivateOffersObject[k].EndDate;
                  break;
                }
              }
            }
          }
          if(!UserPrivateOffer){
              if(IndexToRemove.indexOf(i)==-1){
                IndexToRemove.push(i)
              }
          }
        }
    }

// Remove Offers Exceding the TotalRedemption 
    for(var i=0;i<PublicOffers.length;i++){
      if(PublicOffers[i].TotalRedemption!=null){
        if(PublicOffers[i].ActualRedemption>=PublicOffers[i].TotalRedemption){
          if(IndexToRemove.indexOf(i)==-1){
            IndexToRemove.push(i)
          }
        }
      }
    }

// Convert Dates to Local Time
    for(var i=0;i<PublicOffers.length;i++){
      var auxMoment=moment(PublicOffers[i].PublishedDate);
      var PublishedDateLocal=moment.utc([auxMoment.year(),auxMoment.month(),auxMoment.date(),auxMoment.hour(),auxMoment.minutes(),auxMoment.seconds()])

      var auxMoment=moment(PublicOffers[i].StartDate);
      var StartDateLocal=moment.utc([auxMoment.year(),auxMoment.month(),auxMoment.date(),auxMoment.hour(),auxMoment.minutes(),auxMoment.seconds()])
      
      var auxMoment=moment(PublicOffers[i].EndDate);
      var EndDateLocal=moment.utc([auxMoment.year(),auxMoment.month(),auxMoment.date(),auxMoment.hour(),auxMoment.minutes(),auxMoment.seconds()])

      PublicOffers[i].PublishedDate=PublishedDateLocal;
      PublicOffers[i].StartDate=StartDateLocal;
      PublicOffers[i].EndDate=EndDateLocal;
      }


// Final Filter For All Offers
  for(var i=0;i<PublicOffers.length;i++){
      if(IndexToRemove.indexOf(i)==-1){
        // Adding that Offer because is not in the list
        FinalOfferList.push(PublicOffers[i]);
      }
  }

    // Return JSON Object
    callback(JSON.stringify(FinalOfferList));
}

exports.GetSingleOffer = function GetSingleOffer(UserId,OfferId,Latitude,Longitude,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId, \
                            Offers.ClientId,Offers.Name,Offers.Title,Offers.Subtitle, \
                            Offers.Instructions,Offers.Disclaimer, \
                            Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
                            Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
                            Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
                            Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
                            where Offers.OfferId=" +OfferId
                            +" and Clients.ClientId=Offers.ClientId"

                            db.driver.execQuery(query, function (err, offer) { 

                              if(err){
                                console.log(err);
                                db.close();
                              }else{
                                if(offer.length){
                                db.close();
                                callback(JSON.stringify(offer));
                                console.log("");
                                UpdateOfferEvents(offer[0].ClientId,UserId,OfferId,"Viewed",Latitude,Longitude)
                                }else{
                                  var msj= [{
                                              "State": "OfferId doesn't exist"
                                            }]
                                  callback(JSON.stringify(msj));
                                }
                              }

                            })
            });
        });
}

exports.RedeemSingleOffer = function RedeemSingleOffer(UserId,OfferId,Latitude,Longitude,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId, \
                            Offers.ClientId,Offers.Name,Offers.Title,Offers.Subtitle,Offers.Code, \
                            Offers.Instructions,Offers.Disclaimer, \
                            Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
                            Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
                            Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
                            Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
                            where Offers.OfferId=" +OfferId
                            +" and Clients.ClientId=Offers.ClientId"

                            db.driver.execQuery(query, function (err, offer) { 

                              if(err){
                                console.log(err);
                                db.close();
                              }else{
                                if(offer.length){
                                db.close();
                                callback(JSON.stringify(offer));
                                Redeem(offer[0].ClientId,UserId,OfferId,Latitude,Longitude)
                                }else{
                                  var msj= [{
                                              "State": "OfferId doesn't exist"
                                            }]
                                  callback(JSON.stringify(msj));
                                }
                              }

                            })
            });
        });
}


function Redeem(ClientId,UserId,OfferId,Latitude,Longitude){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query="Select MultiUse from Offers Where OfferId=" +OfferId

                    db.driver.execQuery(query, function (err, offerFlag) { 

                        if(err){
                            console.log(err);
                            db.close();
                        }else{

                    var offerRedeemValidation = db.models.OfferRedemption;
                    var OfferUseType= offerFlag[0].MultiUse

                    offerRedeemValidation.find({ OfferId:OfferId, ClientId:ClientId, UserId:UserId },function (err, offval) {

                            if(err){
                              console.log(err);
                              db.close();
                            }else{
                                if(offval.length && OfferUseType==0){
                                  db.close();
                                  console.log("")
                                  console.log("UserId: " +UserId +" Already Redeemed OfferId: " +OfferId);
                                  console.log("")
                                }else{

                                  var offerRedeem = db.models.OfferRedemption();
                                  offerRedeem.ClientId=ClientId;
                                  offerRedeem.UserId=UserId;
                                  offerRedeem.OfferId=OfferId;
                                  offerRedeem.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");

                                  offerRedeem.save(function (err) {
                                       if (err){
                                          console.log(err);
                                          db.close();
                                       }else{
                                       console.log("")
                                       console.log("UserId: " +UserId +" - Redeemed OfferId: " +OfferId);

                                       var offer = db.models.Offers;

                                        offer.find({ OfferId:OfferId },function (err, off) {

                                          if(err){
                                            console.log(err);
                                            db.close();
                                          }else{
                                            
                                            var ActualRedemption=off[0].ActualRedemption + 1;
                                            off[0].ActualRedemption=ActualRedemption;

                                              off[0].save(function (err) {
                                                 if (err){
                                                    console.log(err);
                                                    db.close();
                                                 }else{
                                                    db.close();
                                                    console.log("OfferId: "+OfferId +" - Actual Redemption: " +ActualRedemption)
                                                    UpdateOfferEvents(ClientId,UserId,OfferId,"Presented",Latitude,Longitude)
                                                 }
                                              })
                                            }
                                        });
                                       }
                                   });
                           }
                      }
                  }) // END OF offerRedeemValidation
                  }
                  }) // END OF MultiUse Flag

            });
        });
}

function UpdateOfferEvents(ClientId,UserId,OfferId,Event,Latitude,Longitude){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var offer_event = db.models.OfferEvents();
                    offer_event.ClientId=ClientId;
                    offer_event.UserId=UserId;
                    offer_event.OfferId=OfferId;
                    offer_event.Event=Event;
                    offer_event.Latitude=Latitude;
                    offer_event.Longitude=Longitude;
                    offer_event.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");

                    offer_event.save(function (err) {
                         if (err){
                            console.log(err);
                            db.close();
                         }else{
                         console.log("UserId: " +UserId +" - Event: " +Event +" - OfferId: " +OfferId);
                         console.log("");
                         db.close();
                         }
                     });
            });
        });
}


exports.GetAllActiveClients = function GetAllActiveClients(callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query="Select ClientId,Name,Logo,ClientHexColor,IsGold,OfferClosestExpiration from Clients \
                    where IsActive=1 and ActiveOffers>0 \
                    Order by IsGold DESC,OfferClosestExpiration ASC,ClientId ASC"

                    db.driver.execQuery(query, function (err, clients) { 

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        db.close();
                        callback(JSON.stringify(clients));
                      }
                    })
            });
        });
}


exports.GetClosestLocations = function GetClosestLocations(Latitude,Longitude,Radius,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query="SELECT Locations.Name,Locations.Latitude,Locations.Longitude,Clients.Logo as ClientLogo, \
                           (6378.10 * ACOS(COS(RADIANS(latpoint)) \
                                    * COS(RADIANS(latitude)) \
                                    * COS(RADIANS(longpoint) - RADIANS(longitude)) \
                                    + SIN(RADIANS(latpoint)) \
                                    * SIN(RADIANS(latitude)))) AS DistanceInKm \
                     FROM Locations,Clients \
                     JOIN ( \
                           SELECT "  +Latitude   +" AS latpoint, "  +Longitude +" AS longpoint \
                       ) AS p \
                     WHERE Locations.Latitude \
                        BETWEEN latpoint  - (" +Radius +" / 111.045) \
                            AND latpoint  + (" +Radius +" / 111.045) \
                       AND Locations.Longitude \
                        BETWEEN longpoint - (" +Radius +" / (111.045 * COS(RADIANS(latpoint)))) \
                            AND longpoint + (" +Radius +" / (111.045 * COS(RADIANS(latpoint)))) \
                       AND Locations.IsPrivate=0 \
                       AND Locations.ClientId=Clients.ClientId \
                     ORDER BY DistanceInKm \
                     LIMIT 15"

                    db.driver.execQuery(query, function (err, locations) { 

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        db.close();
                        callback(JSON.stringify(locations));
                      }
                    })
            });
        });
}


exports.IsOfferValid= function IsOfferValid(UserId,OfferId,ClientId,UserTime,callback){

  orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    
                    var msj= [{
                                "State": ""
                              }]

                    query="Select IsActive from Clients \
                           where ClientId=" +ClientId

                    db.driver.execQuery(query, function (err, client) { 

                          if(err){
                                console.log(err);
                                db.close();
                                msj[0].State=0
                                callback(JSON.stringify(msj))
                           }else{
                              if(client[0]===undefined){
                                  //console.log("Offer Undefined");
                                  db.close();
                                  msj[0].State=0
                                  callback(JSON.stringify(msj))
                                }else{

                                var ClientActive=client[0].IsActive

                                if(client.length && ClientActive==1){

                                        query="Select IsPrivate from Offers \
                                               where OfferId=" +OfferId

                                                db.driver.execQuery(query, function (err, offer) { 

                                                  if(err){
                                                    console.log(err);
                                                    db.close();
                                                    msj[0].State=0
                                                    callback(JSON.stringify(msj))
                                                  }else{

                                                    if(offer[0]===undefined){
                                                      //console.log("Offer Undefined");
                                                      db.close();
                                                      msj[0].State=0
                                                      callback(JSON.stringify(msj))
                                                    }else{
                                                    var OfferUseType=offer[0].IsPrivate

                                                    if(offer.length && OfferUseType==1){
                                                      // Private Offer 

                                                      query="Select UserPrivateOffers.OfferId from UserPrivateOffers,Offers \
                                                      where \
                                                      UserPrivateOffers.OfferId= Offers.OfferId \
                                                      and Offers.IsActive=1 \
                                                      and UserPrivateOffers.OfferId=" +OfferId
                                                      +" and UserPrivateOffers.StartDate<='" +UserTime +"'"
                                                      +" and '" +UserTime +"' <=UserPrivateOffers.EndDate \
                                                      and UserPrivateOffers.UserId=" +UserId
                                                      +" and UserPrivateOffers.OfferId not in \
                                                      (Select distinct OfferRedemption.OfferId \
                                                      from OfferRedemption,Offers \
                                                      where Offers.MultiUse=0 \
                                                      and Offers.IsActive=1 \
                                                      and OfferRedemption.UserId=" +UserId 
                                                      +" and OfferRedemption.OfferId=Offers.OfferId"
                                                      +" and OfferRedemption.OfferId="+OfferId+")";

                                                      //console.log(query)

                                                          db.driver.execQuery(query, function (err, offer) { 

                                                                  if(err){
                                                                    console.log(err);
                                                                    db.close();
                                                                    msj[0].State=0
                                                                    callback(JSON.stringify(msj))
                                                                  }else{
                                                                    db.close();

                                                                    if(offer.length){
                                                                        msj[0].State=1
                                                                        callback(JSON.stringify(msj)) 
                                                                      }else{
                                                                        msj[0].State=0
                                                                        callback(JSON.stringify(msj))
                                                                      }
                                                                  }

                                                          })

                                                    }else{
                                                      // Public Offer

                                                          query="Select Offers.OfferId from Offers \
                                                          where \
                                                          Offers.OfferId=" +OfferId
                                                          +" and Offers.IsActive=1"
                                                          +" and Offers.StartDate<='" +UserTime +"'"
                                                          +" and '" +UserTime +"' <=Offers.EndDate \
                                                          and Offers.OfferId not in \
                                                          (Select distinct OfferRedemption.OfferId \
                                                          from OfferRedemption,Offers \
                                                          where Offers.MultiUse=0 \
                                                          and Offers.IsActive=1 \
                                                          and OfferRedemption.UserId=" +UserId 
                                                          +" and OfferRedemption.OfferId=Offers.OfferId"
                                                          +" and OfferRedemption.OfferId="+OfferId+")";

                                                          //console.log(query)

                                                          db.driver.execQuery(query, function (err, offer) { 

                                                                  if(err){
                                                                    console.log(err);
                                                                    db.close();
                                                                    msj[0].State=0
                                                                    callback(JSON.stringify(msj))
                                                                  }else{
                                                                    db.close();

                                                                    if(offer.length){
                                                                        msj[0].State=1
                                                                        callback(JSON.stringify(msj)) 
                                                                      }else{
                                                                        msj[0].State=0
                                                                        callback(JSON.stringify(msj))
                                                                      }
                                                                  }

                                                          })
                                                        } // End Public Offers
                                                     } // End Valid Offer
                                                  } // Else No Mysql Offer Private Error

                                                }) // Query IsPrivate Execution

                                            }else{
                                              db.close();
                                              msj[0].State=0
                                              callback(JSON.stringify(msj))
                                            } // Client is Inactive
                                        } // Valid Client Object
                                     } // Else No Mysql Client IsActive Error
                              }) // Query Client IsActive Execution Execution
            });
        });

}

exports.IsLocationActive= function IsLocationActive(LocationId,callback){

  orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    var msj= [{
                                "State": ""
                              }]

                    query="Select Locations.IsActive as Location, Clients.IsActive as Client \
                    from Locations,Clients \
                    where LocationId=" +LocationId +" and Clients.ClientId=Locations.ClientId"

                    db.driver.execQuery(query, function (err, active) { 

                      if(err){
                        console.log(err);
                        db.close();
                        msj[0].State="Error";
                        callback(JSON.stringify(msj))
                      }else{
                        //console.log(active)
                        db.close();
                        if(active.length){
                            if(active[0].Location==1 && active[0].Client==1){
                                msj[0].State=1;
                            }else{
                              msj[0].State=0;
                            }
                            callback(JSON.stringify(msj));
                        }else{
                          msj[0].State="Error";
                          callback(JSON.stringify(msj));
                        }
                      }
                    })
            });
        });
}

// LAST 20 Friend Activities
exports.GetFriends = function GetFriends(FriendList,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    if(FriendList==undefined || FriendList.length==0){

                      db.close();
                      var friends= []
                      callback(JSON.stringify(friends));

                    }else{

                    query="SELECT distinct Users.UserId,Users.FbName,Users.FbLastName,Users.FbPhoto, \
                     Users.LastRegister from Users \
                     where Users.UserId in  (" +FriendList +") \
                     order by Users.LastRegister Desc LIMIT 20"

                    db.driver.execQuery(query, function (err, friends) { 

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        db.close();
                        callback(JSON.stringify(friends));
                      }
                    })
                  }
            });
        });
}

// LAST 5 Coupons Redeemed by Friend
exports.GetFriendActivity = function GetFriendActivity(FriendId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query="Select OfferRedemption.OfferId,Offers.Title,Offers.Subtitle,Offers.EndDate, \
                    Offers.PrimaryImage,Offers.SecondaryImage,OfferRedemption.ClientId,Clients.Name as ClientName,Clients.Logo,Max(OfferRedemption.TimeCreated) as TimeCreated \
                    from OfferRedemption,Offers,Clients \
                    where \
                    OfferRedemption.UserId=" +FriendId +" and Clients.ClientId=OfferRedemption.ClientId \
                    and Offers.OfferId=OfferRedemption.OfferId \
                    and Offers.IsPrivate=0 \
                    Group by OfferRedemption.OfferId \
                    Order by TimeCreated DESC LIMIT 5";

                    db.driver.execQuery(query, function (err, friendActivity) { 

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        db.close();
                        callback(JSON.stringify(friendActivity));
                      }
                    })
            });
        });
}

// Helper Function For Messages Functionality
exports.GetOffersId = function GetOffersId(UserTime,UserId,Timezone,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var offer = db.models.Offers;

                    query="Select Clients.Name as ClientName,Clients.Logo,Offers.OfferId,Offers.ClientId, \
                            Offers.Name,Offers.Title,Offers.Subtitle, \
                            Offers.Instructions,Offers.Disclaimer, \
                            Offers.PublishedDate,Offers.StartDate,Offers.EndDate,Offers.Priority, \
                            Offers.ActualRedemption,Offers.TotalRedemption,Offers.MultiUse, \
                            Offers.IsPrivate,Offers.DynamicRedemptionMinutes, \
                            Offers.PrimaryImage,Offers.SecondaryImage from Offers,Clients \
                            where (Offers.PublishedDate <= '" +UserTime +"' and '" +UserTime +"' <= Offers.EndDate) \
                            and Clients.IsActive=1 and Offers.IsActive=1 \
                            and Clients.ClientId=Offers.ClientId"

                    db.driver.execQuery(query, function (err, offers) { 

                              if(err){
                                console.log(err);
                                db.close();
                              }else{
                                db.close();
                                GetPrivateOffers(UserTime,UserId,offers,Timezone,callback);
                              }

                      })

                    
            });
        });
}

// Helper Function For Messages Functionality
exports.UnreadMessagesNumber = function UnreadMessagesNumber(UserId,Offerlist,callback){

        var msj= [{
                      "State": ""
                    }]

        if(Offerlist.length==0){
          msj[0].State=0;
          callback(JSON.stringify(msj))
        }else{

            orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
              if (err) throw err;

                db.load("./Models", function (err) {
                        if (err) throw err;
                        // loaded!
                        var offer = db.models.Offers;

                        query="Select distinct UserId,MessageId \
                        from SentMessages \
                        where UserId=" +UserId
                        +" and MessageRead=0 \
                        and MessageId in (Select MessageId from Messages where IsPrivate=1 \
                        and OfferId in (" +Offerlist +") );"

                        db.driver.execQuery(query, function (err, Messages) { 

                                  if(err){
                                    console.log(err);
                                    db.close();
                                    msj[0].State=0;
                                    callback(JSON.stringify(msj))
                                  }else{
                                    db.close();
                                    msj[0].State=Messages.length;
                                    callback(JSON.stringify(msj))
                                  }
                          })
                });
            });
      }
}

// Helper Function For Messages Functionality
exports.GetMessages = function GetMessages(UserId,Offerlist,callback){

        var msj= []

        if(Offerlist.length==0){
          //console.log("UserId: " +UserId +" - OfferList Is Empty")
          callback(JSON.stringify(msj))
        }else{

            orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
              if (err) throw err;

                db.load("./Models", function (err) {
                        if (err) throw err;
                        // loaded!
                        var offer = db.models.Offers;

                        query="Select distinct MessageId \
                        from SentMessages \
                        where UserId=" +UserId
                        +" and MessageId in (Select MessageId from Messages where IsPrivate=1 \
                        and OfferId in (" +Offerlist +") );"

                        db.driver.execQuery(query, function (err, Messages) { 

                                  if(err){
                                    console.log(err);
                                    db.close();
                                    callback(JSON.stringify(msj))
                                  }else{
                                    db.close();
                                    //console.log(Messages)
                                    //callback(JSON.stringify(msj))
                                    GetMessagesPrivate(UserId,Messages,callback)
                                  }
                          })
                });
            });
      }
}

// Helper Function For Messages Functionality
function GetMessagesPrivate(UserId,Messages,callback){
      var MIds=[]

      for(var i=0;i<Messages.length;i++){
        MIds.push(Messages[i].MessageId)
      }

      var msj= []

        if(MIds.length==0){
          //console.log("UserId: " +UserId +" - MessageList Is Empty")
          callback(JSON.stringify(msj))
        }else{

            orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
              if (err) throw err;

                db.load("./Models", function (err) {
                        if (err) throw err;
                        // loaded!

                        query="Select Clients.ClientId, Clients.Name as ClientName,Clients.Logo,Clients.ClientHexColor, \
                        Messages.MessageId,Messages.Message, Messages.OfferId,SentMessages.MessageRead, \
                        Messages.TimeCreated \
                        from Clients,Messages,SentMessages \
                        where Messages.ClientId=Clients.ClientId \
                        and SentMessages.UserId= " +UserId
                        +" and Messages.MessageId in (" +MIds +")"
                        +" and SentMessages.MessageId=Messages.MessageId" 
                        +" Order by SentMessages.MessageRead,Messages.TimeCreated DESC"

                        db.driver.execQuery(query, function (err, Messages) { 

                                  if(err){
                                    console.log(err);
                                    db.close();
                                    callback(JSON.stringify(msj))
                                  }else{
                                    db.close();
                                    //console.log(Messages)
                                    callback(JSON.stringify(Messages))
                                  }
                          })
                });
            });
      }

  }

// Helper Function For Messages Functionality
exports.ReadMessage = function ReadMessage(UserId,MessageId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    var msj= [{
                      "State": ""
                    }]

                    query="Update SentMessages \
                          Set MessageRead=1 \
                          where UserId=" +UserId
                         +" and MessageId=" +MessageId

                    db.driver.execQuery(query, function (err, friends) { 

                      if(err){
                        console.log(err);
                        db.close();
                        msj[0].State="Error";
                        callback(JSON.stringify(msj))
                      }else{
                        db.close();
                        msj[0].State=1;
                        callback(JSON.stringify(msj))
                      }
                    })
            });
        });
}

exports.GetUsersDeviceToken = function GetUsersDeviceToken(UserQuery,OfferId,ClientId,SendMessageOnly,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    query=UserQuery

                    var ActiveUsers={
                      "iOS":[],
                      "Android":[]
                    }

                    var iOS=[]
                    var Android=[]
                    var UserIds=[]

                    db.driver.execQuery(query, function (err, users) { 

                      if(err){
                        console.log(err);
                        callback(ActiveUsers);
                        db.close();
                      }else{
                        db.close();
                        //console.log(users)
                        //return
                        for(var i=0;i<users.length;i++){
                            if(users[i].PhoneType=="iOS"){
                              iOS.push(users[i].DeviceToken)
                            }else if(users[i].PhoneType=="Android"){
                              Android.push(users[i].DeviceToken)
                            }
                            UserIds.push(users[i].UserId)
                        }

                        //if(SendMessageOnly=="false"){
                          //for(var i=0;i<users.length;i++){
                            //AddPrivateOfferToUser(users[i].UserId,OfferId,ClientId)
                         // }
                       // }

                        if(SendMessageOnly=="false"){
                            AddPrivateOfferRecursive(UserIds,0,OfferId,ClientId,function(){
                                  ActiveUsers["iOS"]=iOS;
                                  ActiveUsers["Android"]=Android;
                                  callback(ActiveUsers);
                            })
                        }else{
                          ActiveUsers["iOS"]=iOS;
                          ActiveUsers["Android"]=Android;
                          callback(ActiveUsers);
                        }

                      }
                    })
            });
        });
}


function AddPrivateOfferRecursive(UserIds,Index,OfferId,ClientId,callback){

  if(Index >= UserIds.length){
      console.log()
      callback();
  }else{
      AddPrivateOfferToUser(UserIds[Index],OfferId,ClientId,function(){
          Index=Index+1;
          AddPrivateOfferRecursive(UserIds,Index,OfferId,ClientId,callback)
      })
  }
}

function AddPrivateOfferToUser(UserId,OfferId,ClientId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;

                    var User= db.models.Users;
                    var Offers= db.models.Offers;

                    Offers.get(OfferId,function (err,offer) {
                        if(err){
                          console.log(err);
                          console.log("Error retrieving data from database - OfferId: " +OfferId);
                          db.close();
                          callback()
                        }else{

                              User.get(UserId,function (err, usr) {
                                  if(err){
                                    console.log(err);
                                    console.log("Error retrieving data from database - UserId: " +UserId);
                                    db.close();
                                    callback();
                                  }else{
                                    
                                    // loaded!
                                    var UserPrivateOffers = db.models.UserPrivateOffers();
                                    UserPrivateOffers.UserId=UserId
                                    UserPrivateOffers.ClientId=ClientId
                                    UserPrivateOffers.OfferId=OfferId

                                    // Calculate Start and End Date Of Private Offer
                                    var LocalTime= moment.utc().zone(usr.Timezone);
                                    var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
                                    var StartDate=LocalToUtc;
                                    var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");
                                    UserPrivateOffers.StartDate=LocalToUtc;

                                    var End= StartDate.add('minutes',offer.DynamicRedemptionMinutes)

                                    if(End.diff(offer.EndDate) > 0){
                                      // Set End Date as Offer End because is greater.
                                      UserPrivateOffers.EndDate=moment(offer.EndDate).format("YYYY-MM-DD HH:mm:ss");
                                    }else{
                                      // Set End Date Dynamic.
                                      UserPrivateOffers.EndDate=End.format("YYYY-MM-DD HH:mm:ss");
                                    }

                                    UserPrivateOffers.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                                    
                                    UserPrivateOffers.save(function (err) {
                                         if (err){
                                            console.log(err);
                                            console.log("ERROR Adding PrivateOffer To User: " +UserId +" - OfferId: " +OfferId);
                                            db.close();
                                            callback()
                                         }else{
                                            console.log("PrivateOffer Added Sucessfully To User: " +UserId +" - OfferId: " +OfferId);
                                            db.close();
                                            callback();
                                         }
                                     });
                                  }
                              });

                         }

                    })

                    

                    
            });
        });
}


exports.ShowGeoMessage= function ShowGeoMessage(LocationId,callback){

  orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!

                    var msj= [{
                                "State": ""
                              }]

                    query="Select Locations.GeoMessage as LocationMsg, Clients.IsActive as Client \
                    from Locations,Clients \
                    where LocationId=" +LocationId +" and Clients.ClientId=Locations.ClientId"

                    db.driver.execQuery(query, function (err, active) { 

                      if(err){
                        console.log(err);
                        db.close();
                        msj[0].State="Error";
                        callback(JSON.stringify(msj))
                      }else{
                        //console.log(active)
                        db.close();
                        if(active.length){
                            if(active[0].LocationMsg==1 && active[0].Client==1){
                                msj[0].State=1;
                            }else{
                              msj[0].State=0;
                            }
                            callback(JSON.stringify(msj));
                        }else{
                          msj[0].State="Error";
                          callback(JSON.stringify(msj));
                        }
                      }
                    })
            });
        });
}
