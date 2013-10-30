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
    console.log("Usuario: " +UserId);
    console.log("Timezone: " +Timezone);
    console.log("LocalTimeForUser: " +LocalTime.format("YYYY-MM-DD HH:mm:ss"));
    console.log("UTCTimeForUser: " +LocalToUtc);
	  
    DAL.GetOffers(LocalToUtc,UserId,Timezone, function (output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });    
}

exports.SingleOffer = function SingleOffer(req,res){

    var UserId=req.params.UserId
    var OfferId=req.params.OfferId

    DAL.GetSingleOffer(OfferId,function(output){
      res.setHeader('Content-Type', 'application/json');
      res.write(output);
      res.end();
    });
}

exports.Redeem= function Redeem(req,res){
    res.end("Sucess");
    var ClientId=req.body.clientId
    var UserId=req.params.UserId
    var OfferId=req.body.offerId
    DAL.Redeem(ClientId,UserId,OfferId);
}