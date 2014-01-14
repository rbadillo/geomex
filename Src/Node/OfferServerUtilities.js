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
    var ClientId= req.query.client_id
	  
    DAL.GetOffers(LocalToUtc,UserId,Timezone,ClientId, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();

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
    var OfferId=req.params.OfferId
    var Latitude= req.query.latitude
    var Longitude= req.query.longitude

    DAL.RedeemSingleOffer(UserId,OfferId,Latitude,Longitude,function(output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });
}

exports.ShowGeoMessage= function ShowGeoMessage(req,res){
    var UserId=req.params.UserId
    var OfferId=req.params.OfferId

    DAL.ShowGeoMessage(UserId,OfferId,function(output){
      var tmp= JSON.parse(output)
      res.setHeader('Content-Type', 'application/json');
      if(tmp.State=="False"){
        res.statusCode=404
      }
      res.write(output);
      res.end();
      console.log("ShowGeoMessage - UserId: " +UserId +" - OfferId: " +OfferId);
      console.log("");
    });
}
