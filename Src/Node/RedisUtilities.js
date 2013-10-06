var redis = require("redis");
var client = redis.createClient();

client.on("error", function (err) {
        console.log("Error " + err);
 });

exports.GetUsersByLocationId = function GetUsersByLocationId(LocationId,callback){

 		client.hgetall(LocationId, function (err, obj) {

 			if(err){
 				//console.log(err)
 				//console.log("Location: "+LocationId +" Is Empty");
 				callback("");
 			}else{
 				//console.log("Redis - GetUsersByLocationId");
 				//console.log(obj);
 				//return obj;
 				callback(JSON.stringify(obj));
 			}
 		});        
  }

 exports.AddUserToLocation = function AddUserToLocation(LocationId,PhoneType,DeviceToken){

 		client.hgetall(LocationId, function (err, obj) {

 			if(err){
 				console.log(err)
 			}else{
 					if(obj){
	 					//console.log(obj);
	 					//console.log("PhoneType: " +PhoneType)
	 					//console.log("LocationId: " +LocationId)
	 					//console.log("DeviceToken: " +DeviceToken)
	 					//console.log(obj[PhoneType]);
				        ActiveUsers=obj[PhoneType];
				        ActiveUsers=ActiveUsers.split(",");
				        //console.log(ActiveUsers);
				        var index = ActiveUsers.indexOf(DeviceToken);
				        //console.log("Index: " +index);

				        if(index==-1){
					        ActiveUsers.push(DeviceToken);
					        //console.log(ActiveUsers);

					        if(ActiveUsers[0]==''){
					        	ActiveUsers.shift();
					        }

					        client.hmset(LocationId, PhoneType, ActiveUsers, function (err, res) {
							         if(err){
						 				console.log(err)
						 			}else{
							            console.log(PhoneType +" Key Has Been Updated with this Device Token: " +DeviceToken);
					    			}
		 					});
		 				}else{
		 					console.log("User is Already in LocationId: " +LocationId);
		 				}

			    	}else{
			    		console.log("First User in LocationId: "+LocationId);

		 				client.hmset(LocationId, PhoneType, DeviceToken, function (err, res) {
							         if(err){
						 				console.log(err)
						 			}else{
							            console.log(PhoneType +" Key Has Been Updated with this Device Token: " +DeviceToken);
					    			}
		 					});
			    	}
 				}
 		});        
  }


exports.RemoveUserFromLocation = function RemoveUserFromLocation(LocationId,PhoneType,DeviceToken){

 		client.hgetall(LocationId, function (err, obj) {

 			if(err){
 				console.log(err)
 			}else{
 					if(obj){
 						//console.log(obj);
	 					//console.log("PhoneType: " +PhoneType)
	 					//console.log("LocationId: " +LocationId)
	 					//console.log("DeviceToken: " +DeviceToken)
	 					//console.log(obj[PhoneType]);
				        ActiveUsers=obj[PhoneType];
				        ActiveUsers=ActiveUsers.split(",");
				        //console.log(ActiveUsers);
				        var index = ActiveUsers.indexOf(DeviceToken);
				        //console.log("Index: " +index);

				        if(index!=-1){
					        ActiveUsers.splice(index,1);
					        //console.log(ActiveUsers);

					        if(ActiveUsers[0]==''){
					        	ActiveUsers.shift();
					        }

					        client.hmset(LocationId, PhoneType, ActiveUsers, function (err, res) {
							         if(err){
						 				console.log(err)
						 			}else{
							            console.log(PhoneType +" Key Has Been Updated by removing this Device Token: " +DeviceToken);
					    			}
		 					});
		 				}else{
		 					console.log("User is not in LocationId: " +LocationId);
		 				}

 					}else{
 						console.log("Can't Remove From Location: "+LocationId +" Because This Location Is Empty");
 					}
 				}
 		});        
  }

