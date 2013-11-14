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
    console.log("Usuario: " +UserId);
    console.log("Timezone: " +Timezone);
    console.log("LocalTimeForUser: " +LocalTime.format("YYYY-MM-DD HH:mm:ss"));
    console.log("UTCTimeForUser: " +LocalToUtc);
    console.log("ClientId: " +ClientId);
	  
    DAL.GetOffers(LocalToUtc,UserId,Timezone,ClientId, function (output){
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

exports.OfferEvents= function Redeem(req,res){
    
    var ClientId=req.body.clientId
    var UserId=req.params.UserId
    var OfferId=req.body.offerId
    var Event=req.body.event
    if(Event=="Viewed" || Event == "Presented"){
        res.end("Sucess");
        DAL.UpdateOfferEvents(ClientId,UserId,OfferId,Event);
    }else{
        res.end("Error");
    }
}