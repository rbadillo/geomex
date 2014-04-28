var request = require('request');

//FeatureServer
exports.GetAllActiveClients = function GetAllActiveClients(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.GetClosestLocations = function GetClosestLocations(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.GetFriends = function GetFriends(req,res){
	RedirectUrl=req.originalUrl
	request.post('http://127.0.0.1:4000'+RedirectUrl,{form:req.body}).pipe(res)
	console.log()
}

exports.GetFriendActivity = function GetFriendActivity(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.IsLocationActive = function IsLocationActive(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.GetUnreadMessages = function GetUnreadMessages(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.GetMessages = function GetMessages(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.ReadMessage = function ReadMessage(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.ShowGeoMessage = function ShowGeoMessage(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:4000'+RedirectUrl).pipe(res)
	console.log()
}

exports.AppEvent = function AppEvent(req,res){
	RedirectUrl=req.originalUrl
	request.post('http://127.0.0.1:4000'+RedirectUrl,{form:req.body}).pipe(res)
	console.log()
}


//OfferServer
exports.Offers = function Offers(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:5000'+RedirectUrl).pipe(res)
	console.log()
}

exports.SingleOffer = function SingleOffer(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:5000'+RedirectUrl).pipe(res)
	console.log()
}

exports.Redeem = function Redeem(req,res){
	RedirectUrl=req.originalUrl
	request.get('http://127.0.0.1:5000'+RedirectUrl).pipe(res)
	console.log()
}



//RegisterServer
exports.Register = function Register(req,res){
	RedirectUrl=req.originalUrl
	request.post('http://127.0.0.1:8000'+RedirectUrl,{form:req.body}).pipe(res)
	console.log()
}

exports.GeoEvent = function GeoEvent(req,res){
	RedirectUrl=req.originalUrl
	request.post('http://127.0.0.1:8000'+RedirectUrl,{form:req.body}).pipe(res)
	console.log()
}


//QueueWorker
exports.SendMessage = function SendMessage(req,res){
	RedirectUrl=req.originalUrl
	request.post('http://127.0.0.1:7000'+RedirectUrl,{form:req.body}).pipe(res)
	console.log()
}
