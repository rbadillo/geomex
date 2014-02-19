var DAL= require('./Database');
var moment = require('moment');

exports.Test = function Test(req,res){
	res.end('Offer Server - OK');
}

exports.Offers = function Offers(req,res){

    var UserId=req.params.UserId
    var Timezone=req.params.Timezone
    var LocalTime= moment.utc().zone(Timezone);
    var LocalToUtc= moment([LocalTime.year(),LocalTime.month(),LocalTime.date(),LocalTime.hour(),LocalTime.minutes(),LocalTime.seconds()]).utc();
    var LocalToUtc= LocalToUtc.format("YYYY-MM-DD HH:mm:ss");
    var ClientId= req.params.ClientId
	  
    DAL.GetOffers(LocalToUtc,UserId,Timezone,ClientId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();

      console.log("");
      console.log("UserId: " +UserId);
      console.log("Timezone: " +Timezone);
      console.log("LocalTimeForUser: " +LocalTime.format("YYYY-MM-DD HH:mm:ss"));
      console.log("UTCTimeForUser: " +LocalToUtc);
      console.log("ClientId: " +ClientId);
      console.log("");
    });    
}

exports.SingleOffer = function SingleOffer(req,res){

    var UserId=req.params.UserId
    var ClientId= req.params.ClientId
    var OfferId=req.params.OfferId
    var Latitude= req.query.latitude
    var Longitude= req.query.longitude  

    DAL.GetSingleOffer(UserId,OfferId,Latitude,Longitude,function(output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });
}

exports.Redeem= function Redeem(req,res){
    var UserId=req.params.UserId
    var ClientId= req.params.ClientId
    var OfferId=req.params.OfferId
    var Latitude= req.query.latitude
    var Longitude= req.query.longitude

    DAL.RedeemSingleOffer(UserId,OfferId,Latitude,Longitude,function(output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });
}

exports.IsOfferValid= function IsOfferValid(req,res){
    var UserId=req.params.UserId
    var OfferId=req.params.OfferId

    DAL.IsOfferValid(UserId,OfferId,function(output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp[0].State==0){
        res.statusCode=404
      }
      res.write(output);
      res.end();
      console.log("");
      console.log("IsOfferValid - UserId: " +UserId +" - OfferId: " +OfferId +" - ValidState: " +tmp[0].State);
      console.log("");
    });
}
