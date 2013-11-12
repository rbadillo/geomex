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
                        db.close();
                      }else{
                        if(clnt.length){
                            console.log("Existing Client");
                            db.close();
                          }else{
                            var cliente = db.models.Clients();
                            cliente.Name=Name
                            
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
                        db.close();
                      }else{
                        if(loc.length){
                            console.log("Existing Location");
                            db.close();
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
                                    db.close();
                                 }else{
                                 console.log("Location Added Sucessfully");
                                 db.close();
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
                        db.close();
                      }else{
                        console.log("Id: " +loc[0].LocationId);
                        db.close();
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
                          db.close();
                      }else{
                          if(msj.length){
                            console.log("Existing Message");
                            db.close();
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
                                        db.close();
                                     }else{
                                     console.log("Message Added Sucessfully");
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
                                    db.close();
                                 }else{
                                 console.log("User Added Sucessfully");
                                 db.close();
                                 GetClientIdByLocationId(UserId,LocationId,Event);
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
                                    db.close();
                                 }else{
                                 console.log("User Updated Sucessfully");
                                 db.close();
                                 GetClientIdByLocationId(UserId,LocationId,Event);
                                 }
                             });
                          }
                    });
            });
        });
}

function GetClientIdByLocationId(UserId,LocationId,Event){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var Local= db.models.Locations;

                    Local.get(LocationId,function (err, loc) {
                        if(err){
                            console.log(err);
                            db.close();
                        }else{
                            console.log("Location Exist");
                            //console.log(loc.ClientId);
                            db.close();
                            UpdateLocationEvents(UserId,loc.ClientId,LocationId,loc.Name,Event);
                          }
                    });
            });
        });
}

function UpdateLocationEvents(UserId,ClientId,LocationId,LocationName,Event){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
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
                    LocationEventAnalytics.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");
                    
                    LocationEventAnalytics.save(function (err) {
                         if (err){
                            console.log(err);
                            db.close();
                         }else{
                         console.log("LocationEvents Updated Sucessfully");
                         db.close();
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
                            db.close();
                         }else{
                         console.log("SentMessage Added Sucessfully");
                         db.close();
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
                            db.close();
                        }else{
                            console.log("SentMessage Deleted Sucessfully");
                            db.close();
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
                            db.close();
                        }else{
                            //console.log(msj[0].MessageId);
                            if(Action=="Add"){
                              AddSentMessage(UserId,msj[0].MessageId);
                            }else if (Action=="Delete"){
                               DeleteSentMessage(UserId,msj[0].MessageId);
                            }
                            db.close();   
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
                            db.close();
                        }else{
                            //console.log(usr[0].UserId);
                            GetMessageId(usr[0].UserId,Message,Action);
                            db.close();
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

exports.GetOffers = function GetOffers(UserTime,UserId,Timezone,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var offer = db.models.Offers;

                    offer.find({ PublishedDate:orm.lte(UserTime), EndDate:orm.gte(UserTime)  },function (err, off) {

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        //console.log(off.length);
                        //for(var i=0;i<off.length;i++){
                          //  console.log("Oferta: " +off[i].Id +" - Name: " +off[i].Name);
                        //}
                        db.close();
                        GetPrivateOffers(UserTime,UserId,off,Timezone,callback);
                      }
                    });
            });
        });
}


function GetPrivateOffers(UserTime,UserId,PublicOffers,Timezone,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var privateOffer = db.models.UserPrivateOffers;

                    privateOffer.find( {StartDate:orm.lte(UserTime), EndDate:orm.gte(UserTime)  },function (err, off) {

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        //console.log(off.length);
                        //for(var i=0;i<off.length;i++){
                          //  console.log("Private OfertaId: " +off[i].OfferId +" - UserId: " +off[i].UserId);
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

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var redemption = db.models.OfferRedemption;

                    redemption.find( {OfferId: ofertas},function (err, off) {

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
                        FilterOffers(PublicOffers,ofertasPrivadas,ofertasUsadas,Timezone,callback);
                      }
                    });
            });
        });
}


function FilterOffers(PublicOffers,PrivateOffers,RedemedOffers,Timezone,callback){

// Remove Offers Already Redeemed
  for(var i=0;i<PublicOffers.length;i++){
      for(var j=0;j<RedemedOffers.length;j++){
        if(PublicOffers[i].OfferId==RedemedOffers[j] && PublicOffers[i].MultiUse==0){
          PublicOffers.splice(i,1);
        }
      }
    }

// Remove PrivateOffers Already Redeemed
   for(var i=0;i<PrivateOffers.length;i++){
      for(var j=0;j<RedemedOffers.length;j++){
        if(PrivateOffers[i]==RedemedOffers[j]){
          PrivateOffers.splice(i,1);
        }
      }
    }

// Remove PrivateOffers Not added to User
    for(var i=0;i<PublicOffers.length;i++){
        var UserPrivateOffer= false;
        if(PublicOffers[i].Visibility=="private"){
          for(var j=0;j<PrivateOffers.length;j++){
            if(PublicOffers[i].OfferId==PrivateOffers[j]){
              UserPrivateOffer=true;
            }
          }
          if(!UserPrivateOffer){
            PublicOffers.splice(i,1);
          }
        }
    }

// Remove Offers Exceding the TotalRedemption 
    for(var i=0;i<PublicOffers.length;i++){
      if(PublicOffers[i].TotalRedemption!=null){
        if(PublicOffers[i].ActualRedemption>=PublicOffers[i].TotalRedemption){
          PublicOffers.splice(i,1);
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

    // Return JSON Object
    callback(JSON.stringify(PublicOffers));
}

exports.GetSingleOffer = function GetSingleOffer(OfferId,callback){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var offer = db.models.Offers;

                    offer.find({ OfferId:OfferId },function (err, off) {

                      if(err){
                        console.log(err);
                        db.close();
                      }else{
                        //console.log(off.length);
                        //for(var i=0;i<off.length;i++){
                          //  console.log("Oferta: " +off[i].Id +" - Name: " +off[i].Name);
                        //}
                        db.close();
                        callback(JSON.stringify(off));
                      }
                    });
            });
        });
}


exports.Redeem = function Redeem(ClientId,UserId,OfferId){

        orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex?debug=true", function (err, db) {
          if (err) throw err;

            db.load("./Models", function (err) {
                    if (err) throw err;
                    // loaded!
                    var offer = db.models.OfferRedemption();
                    offer.ClientId=ClientId;
                    offer.UserId=UserId;
                    offer.OfferId=OfferId;
                    offer.TimeCreated=moment.utc().format("YYYY-MM-DD HH:mm:ss");

                    offer.save(function (err) {
                         if (err){
                            console.log(err);
                            db.close();
                         }else{
                         console.log("User: " +UserId +" Redeemed Offer: " +OfferId);
                         db.close();
                         }
                     });
            });
        });
}

//GetOffers("2013-10-22 17:00:00","517218456");
//GetPrivateOffers("2013-10-22 17:00:00","517218456");
//GetUserRedemption("517218456",[1,2,3,4,5,6,7,8],[1,2,3,4,5,6,7,8]);
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