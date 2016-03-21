var DAL= require('./Database');
var moment = require('moment');
var orm = require("orm");

exports.Test = function Test(req,res){
	res.end('Offer Server - OK');
}

exports.Offers = function Offers(req,res){

  orm.connect("mysql://root:EstaTrivialDb!@localhost/geomex", function (err, db) {

    if (err)
    {
      console.log(err)
      res.statusCode=406
      res.end();
    }
    else
    {
      var UserId=req.params.UserId

      if(UserId == null || UserId=="null" ||  UserId == undefined || UserId=="undefined" || UserId=="(null)")
      {
        db.close()
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
        var Timezone=req.params.Timezone
        var LocalTime= moment.utc().zone(Timezone);
        var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
        var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");
        var ClientId= req.params.ClientId
        var Latitude= req.query.latitude
        var Longitude= req.query.longitude
    	  
        // db assign Models
        db.models = req.db.models
        DAL.GetOffers(db,LocalToUtc,UserId,Timezone,ClientId, function (output){

          // Close DB
          db.close()
          
          // Create ViewedClientOffers Analytic Record
          DAL.UpdateAppEvents(db,UserId,ClientId,"ViewedClientOffers",Latitude,Longitude);
          
          console.log("");
          console.log("UserId: " +UserId);
          console.log("Timezone: " +Timezone);
          console.log("LocalTimeForUser: " +LocalTime.format("YYYY-MM-DD HH:mm:ss"));
          console.log("UTCTimeForUser: " +LocalToUtc);
          console.log("ClientId: " +ClientId);
          console.log("");

          res.setHeader('Content-Type', 'application/json');
          res.write(output);
          res.end();
        });
      }  
    }  
  })
}

exports.SingleOffer = function SingleOffer(req,res){

    var UserId=req.params.UserId

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
      var ClientId= req.params.ClientId
      var OfferId=req.params.OfferId
      var Latitude= req.query.latitude
      var Longitude= req.query.longitude
      var Timezone=req.params.Timezone
      var LocalTime= moment.utc().zone(Timezone);
      var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
      var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

      DAL.IsOfferValid(req.db,UserId,OfferId,ClientId,LocalToUtc,function(output){
        var tmp= JSON.parse(output)
        if(tmp[0].State==0)
        {
            console.log("");
            console.log("ERROR - UserId: "+UserId +" - ClientId: " +ClientId +" - Status: Client Active/Inactive" +" - OfferId: " +OfferId +" - Status: Offer Redeemed/Inactive/Doesn't Exist");
            console.log("");
            
            res.setHeader('Content-Type', 'application/json');
            res.statusCode=406
            var msj=  [{
                      "State": "UserId: "+UserId +" - ClientId: " +ClientId +" - Status: Client Active/Inactive" +" - OfferId: " +OfferId +" - Status: Offer Redeemed/Inactive/Doesn't Exist"
                      }]
            var response= JSON.stringify(msj)
            res.write(response);
            res.end();
        }
        else
        {
            DAL.GetSingleOffer(req.db,UserId,OfferId,Latitude,Longitude,function(output){
                var tmp= JSON.parse(output)
                if(tmp.length==0 || tmp[0].hasOwnProperty("State"))
                {
                    console.log("");
                    console.log("ERROR - UserId: "+UserId +" - ClientId: " +ClientId +" - OfferId: " +OfferId +" - Status: Offer Redeemed/Inactive/Doesn't Exist");
                    console.log("");

                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode=406
                    var msj=  [{
                              "State": "UserId: "+UserId +" - ClientId: " +ClientId +" - OfferId: " +OfferId +" - Status: Offer Redeemed/Inactive/Doesn't Exist"
                              }]
                    var response= JSON.stringify(msj)
                    res.write(response);
                    res.end();
                }
                else
                {
                  res.setHeader('Content-Type', 'application/json');
                  res.write(output);
                  res.end();
                }
            });
        }
      });
    }
}

exports.Redeem= function Redeem(req,res){
    var UserId=req.params.UserId

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
      var ClientId= req.params.ClientId
      var OfferId=req.params.OfferId
      var Latitude= req.query.latitude
      var Longitude= req.query.longitude
      var Timezone=req.params.Timezone
      var LocalTime= moment.utc().zone(Timezone);
      var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
      var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");

      DAL.IsOfferValid(req.db,UserId,OfferId,ClientId,LocalToUtc,function(output){
        var tmp= JSON.parse(output)
        if(tmp[0].State==0)
        {
            console.log("");
            console.log("ERROR - UserId: "+UserId +" - ClientId: " +ClientId +" - Status: Client Active/Inactive" +" - OfferId: " +OfferId +" - Status: Offer Redeemed/Inactive/Doesn't Exist");
            console.log("");
            
            res.setHeader('Content-Type', 'application/json');
            res.statusCode=406
            var msj=  [{
                      "State": "UserId: "+UserId +" - ClientId: " +ClientId +" - Status: Client Active/Inactive" +" - OfferId: " +OfferId +" - Status: Offer Redeemed/Inactive/Doesn't Exist"
                      }]
            var response= JSON.stringify(msj)
            res.write(response);
            res.end();
        }
        else
        {
            DAL.RedeemSingleOffer(req.db,UserId,OfferId,Latitude,Longitude,function(output){
              var tmp= JSON.parse(output)
              if(tmp.length==0 || tmp[0].hasOwnProperty("State"))
              {
                console.log("");
                console.log("ERROR - UserId: "+UserId +" - ClientId: " +ClientId +" - Status: Client Active/Inactive" +" - OfferId: " +OfferId +" - Status: Error Redeeming Offer");
                console.log("");

                res.setHeader('Content-Type', 'application/json');
                res.statusCode=406
                var msj=  [{
                          "State": "UserId: "+UserId +" - ClientId: " +ClientId +" - Status: Client Active/Inactive" +" - OfferId: " +OfferId +" - Status: Error Redeeming Offer"
                          }]
                var response= JSON.stringify(msj)
                res.write(response);
                res.end();
              }
              else
              {
                res.setHeader('Content-Type', 'application/json');
                res.write(output);
                res.end();
              }
            });
        }
      });
    }
}

