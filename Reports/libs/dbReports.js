var mysql = require('mysql');
var moment = require('moment');

// Local Variables

exports.totalUsers = function totalUsers(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="SELECT count(*) as totalUsers FROM Users"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.totalUsersByGender = function totalUsersByGender(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select Male.totalUsersMale,Female.totalUsersFemale \
	  		FROM \
			( \
			Select count(distinct UserId) as totalUsersMale FROM Users \
			Where FbGender='male' \
			) Male \
			JOIN \
			( \
			Select count(distinct UserId) as totalUsersFemale FROM Users \
			Where FbGender='female' \
			) Female";

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.totalUsersAppOpen = function totalUsersAppOpen(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="Select '__DATE__' as Date,count(*) totalOpenedApps from AppEvents where Event='OpenedApp' AND DATE(_Created) = '__DATE__'"
	  queryString = queryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	queryString = queryString + " UNION Select '__DATE__' as Date,count(*) totalOpenedApps from AppEvents where Event='OpenedApp' AND DATE(_Created) = '__DATE__'"
	  	queryString = queryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + " ORDER BY Date ASC";

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}

exports.totalUsersAppOpenUnique = function totalUsersAppOpenUnique(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="Select '__DATE__' as Date,count(distinct UserId) as totalOpenedAppsUnique from AppEvents where Event='OpenedApp' AND DATE(_Created) = '__DATE__'"
	  queryString = queryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	queryString = queryString + " UNION Select '__DATE__' as Date,count(distinct UserId) as totalOpenedAppsUnique from AppEvents where Event='OpenedApp' AND DATE(_Created) = '__DATE__'"
	  	queryString = queryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + " ORDER BY Date ASC";

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}

exports.totalUsersAppOpenByGender = function totalUsersAppOpenByGender(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="Select Male.Date,Male.totalOpenedAppsMale,Female.totalOpenedAppsFemale FROM ("
	  
	  var maleQueryString="Select '__DATE__' as Date,count(*) as totalOpenedAppsMale from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='male' AND DATE(AppEvents._Created) = '__DATE__'"
	  maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	maleQueryString = maleQueryString + " UNION Select '__DATE__' as Date,count(*) as totalOpenedAppsMale from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='male' AND DATE(AppEvents._Created) = '__DATE__'"
	  	maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + maleQueryString +" ) Male JOIN ("

	  var femaleQueryString="Select '__DATE__' as Date,count(*) as totalOpenedAppsFemale from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='female' AND DATE(AppEvents._Created) = '__DATE__'"
	  femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	femaleQueryString = femaleQueryString + " UNION Select '__DATE__' as Date,count(*) as totalOpenedAppsFemale from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='female' AND DATE(AppEvents._Created) = '__DATE__'"
	  	femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + femaleQueryString +" ) Female ON Male.Date=Female.Date ORDER BY Date ASC"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}

exports.totalUsersAppOpenByGenderUnique = function totalUsersAppOpenByGenderUnique(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="Select Male.Date,Male.totalOpenedAppsMaleUnique,Female.totalOpenedAppsFemaleUnique FROM ("
	  
	  var maleQueryString="Select '__DATE__' as Date,count(distinct AppEvents.UserId) as totalOpenedAppsMaleUnique from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='male' AND DATE(AppEvents._Created) = '__DATE__'"
	  maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	maleQueryString = maleQueryString + " UNION Select '__DATE__' as Date,count(distinct AppEvents.UserId) as totalOpenedAppsMaleUnique from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='male' AND DATE(AppEvents._Created) = '__DATE__'"
	  	maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + maleQueryString +" ) Male JOIN ("

	  var femaleQueryString="Select '__DATE__' as Date,count(distinct AppEvents.UserId) as totalOpenedAppsFemaleUnique from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='female' AND DATE(AppEvents._Created) = '__DATE__'"
	  femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	femaleQueryString = femaleQueryString + " UNION Select '__DATE__' as Date,count(distinct AppEvents.UserId) as totalOpenedAppsFemaleUnique from AppEvents,Users where AppEvents.Event='OpenedApp'  and AppEvents.UserId= Users.UserId AND Users.FbGender='female' AND DATE(AppEvents._Created) = '__DATE__'"
	  	femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + femaleQueryString +" ) Female ON Male.Date=Female.Date ORDER BY Date ASC"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}

exports.clientReports = function clientReports(callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select ClientId,Name from Clients WHERE isActive=1"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}


exports.clientReportTotalClicks = function clientReportTotalClicks(clientId, callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,COUNT(*) AS totalClicks FROM AppEvents,Clients WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.ClientId =" +clientId
	  queryString = queryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	queryString = queryString + " UNION SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,COUNT(*) AS totalClicks FROM AppEvents,Clients WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.ClientId =" +clientId
	  	queryString = queryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + " ORDER BY Date ASC";

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}


exports.clientReportTotalClicksUnique = function clientReportTotalClicksUnique(clientId, callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,COUNT(distinct UserId) AS totalClicksUnique FROM AppEvents,Clients WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.ClientId =" +clientId
	  queryString = queryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	queryString = queryString + " UNION SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,COUNT(distinct UserId) AS totalClicksUnique FROM AppEvents,Clients WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.ClientId =" +clientId
	  	queryString = queryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + " ORDER BY Date ASC";

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}

exports.clientReportTotalClicksByGender = function clientReportTotalClicksByGender(clientId, callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="Select Male.Date,Male.Name,Male.Event,Male.totalClicksMale,Female.totalClicksFemale FROM ("
	  
	  var maleQueryString="SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(*) AS totalClicksMale FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'male' AND AppEvents.ClientId = " +clientId
	  maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	maleQueryString = maleQueryString + " UNION SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(*) AS totalClicksMale FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'male' AND AppEvents.ClientId = " +clientId
	  	maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + maleQueryString +" ) Male JOIN ("

	  var femaleQueryString="SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(*) AS totalClicksFemale FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'female' AND AppEvents.ClientId = " +clientId

	  femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	femaleQueryString = femaleQueryString + " UNION SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(*) AS totalClicksFemale FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'female' AND AppEvents.ClientId = " +clientId
	  	femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + femaleQueryString +" ) Female ON Male.Date=Female.Date ORDER BY Date ASC"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}

exports.clientReportTotalClicksByGenderUnique = function clientReportTotalClicksByGenderUnique(clientId, callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var dateRange = []

	  // Last 14 days
	  for(var i=0;i<14;i++)
	  {
	  	dateRange.push(moment().subtract('days',i).format('YYYY-MM-DD'))
	  }

	  var queryString="Select Male.Date,Male.Name,Male.Event,Male.totalClicksMaleUnique,Female.totalClicksFemaleUnique FROM ("
	  
	  var maleQueryString="SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(distinct AppEvents.UserId) AS totalClicksMaleUnique FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'male' AND AppEvents.ClientId = " +clientId
	  maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	maleQueryString = maleQueryString + " UNION SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(distinct AppEvents.UserId) AS totalClicksMaleUnique FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'male' AND AppEvents.ClientId = " +clientId
	  	maleQueryString = maleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + maleQueryString +" ) Male JOIN ("

	  var femaleQueryString="SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(distinct AppEvents.UserId) AS totalClicksFemaleUnique FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'female' AND AppEvents.ClientId = " +clientId

	  femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[0])

	  for(var i=1;i<dateRange.length;i++)
	  {
	  	femaleQueryString = femaleQueryString + " UNION SELECT '__DATE__' AS Date,Clients.ClientId,Clients.Name,AppEvents.Event,COUNT(distinct AppEvents.UserId) AS totalClicksFemaleUnique FROM AppEvents,Clients,Users WHERE AppEvents.Event = 'ViewedClientOffers' AND AppEvents.ClientId = Clients.ClientId AND DATE(AppEvents._Created) = '__DATE__' AND AppEvents.UserId = Users.UserId AND Users.FbGender = 'female' AND AppEvents.ClientId = " +clientId
	  	femaleQueryString = femaleQueryString.replace(/__DATE__/g,dateRange[i])
	  }

	  queryString = queryString + femaleQueryString +" ) Female ON Male.Date=Female.Date ORDER BY Date ASC"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows,dateRange)
		});
	});
}


exports.clientOffers = function clientOffers(clientId, callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select OfferId,Name,Title,Subtitle FROM Offers WHERE ClientId=" +clientId

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.offerReportTotalViews = function offerReportTotalViews(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select COUNT(*) as totalViews from OfferEvents where ClientId=" +clientId +" and OfferId=" +offerId +" and Event='Viewed'"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}


exports.offerReportTotalViewsUnique = function offerReportTotalViewsUnique(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select COUNT(distinct UserId) as totalViewsUnique from OfferEvents where ClientId=" +clientId +" and OfferId=" +offerId +" and Event='Viewed'"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.offerReportTotalViewsByGender = function offerReportTotalViewsByGender(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var tempQueryString = "Select Male.totalViewsByMale,Female.totalViewsByFemale FROM ("

	  var maleQueryString = "SELECT COUNT(OfferEvents.UserId) as totalViewsByMale FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Viewed' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='male'"
	  
	  var tempQueryString2 = " ) Male JOIN ( "

	  var femaleQueryString = "SELECT COUNT(OfferEvents.UserId) as totalViewsByFemale FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Viewed' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='female'"

	  var tempQueryString3 = " ) Female"

	  var queryString= tempQueryString +maleQueryString +tempQueryString2 +femaleQueryString +tempQueryString3

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.offerReportTotalViewsByGenderUnique = function offerReportTotalViewsByGenderUnique(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var tempQueryString = "Select Male.totalViewsByMaleUnique,Female.totalViewsByFemaleUnique FROM ("

	  var maleQueryString = "SELECT COUNT(distinct OfferEvents.UserId) as totalViewsByMaleUnique FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Viewed' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='male'"
	  
	  var tempQueryString2 = " ) Male JOIN ( "

	  var femaleQueryString = "SELECT COUNT(distinct OfferEvents.UserId) as totalViewsByFemaleUnique FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Viewed' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='female'"

	  var tempQueryString3 = " ) Female"

	  var queryString= tempQueryString +maleQueryString +tempQueryString2 +femaleQueryString +tempQueryString3

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}


exports.offerReportTotalRedemptions = function offerReportTotalRedemptions(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select COUNT(*) as totalRedemptions from OfferEvents where ClientId=" +clientId +" and OfferId=" +offerId +" and Event='Presented'"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.offerReportTotalRedemptionsUnique = function offerReportTotalRedemptionsUnique(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var queryString="Select COUNT(distinct UserId) as totalRedemptionsUnique from OfferEvents where ClientId=" +clientId +" and OfferId=" +offerId +" and Event='Presented'"

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

exports.offerReportTotalRedemptionsByGender = function offerReportTotalRedemptionsByGender(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var tempQueryString = "Select Male.totalRedemptionsByMale,Female.totalRedemptionsByFemale FROM ("

	  var maleQueryString = "SELECT COUNT(OfferEvents.UserId) as totalRedemptionsByMale FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Presented' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='male'"
	  
	  var tempQueryString2 = " ) Male JOIN ( "

	  var femaleQueryString = "SELECT COUNT(OfferEvents.UserId) as totalRedemptionsByFemale FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Presented' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='female'"

	  var tempQueryString3 = " ) Female"

	  var queryString= tempQueryString +maleQueryString +tempQueryString2 +femaleQueryString +tempQueryString3

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}


exports.offerReportTotalRedemptionsByGenderUnique = function offerReportTotalRedemptionsByGenderUnique(clientId,offerId,callback){

	var connection = mysql.createConnection({
	  host     : '192.168.0.16',
	  user     : 'root',
	  password : 'EstaTrivialDb!',
	  database : 'geomex'
	});

	connection.connect(function(err) {
	  if(err)
	  {
	    console.log('Error connecting to Mysql Database: ' +err);
	    return callback(err);
	  }

	  var tempQueryString = "Select Male.totalRedemptionsByMaleUnique,Female.totalRedemptionsByFemaleUnique FROM ("

	  var maleQueryString = "SELECT COUNT(distinct OfferEvents.UserId) as totalRedemptionsByMaleUnique FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Presented' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='male'"
	  
	  var tempQueryString2 = " ) Male JOIN ( "

	  var femaleQueryString = "SELECT COUNT(distinct OfferEvents.UserId) as totalRedemptionsByFemaleUnique FROM OfferEvents,Users WHERE OfferEvents.ClientId=" +clientId +" AND OfferEvents.OfferId=" +offerId +" AND OfferEvents.Event='Presented' AND OfferEvents.UserId = Users.UserId AND Users.FbGender='female'"

	  var tempQueryString3 = " ) Female"

	  var queryString= tempQueryString +maleQueryString +tempQueryString2 +femaleQueryString +tempQueryString3

	  connection.query(queryString, function(err, rows, fields) {
		  if(err)
		  {
		  	console.log('Error executing Total Users Query: ' +err);
		  	connection.end();
		  	return callback(err);
		  }
		  connection.end();
		  return callback(null,rows)
		});
	});
}

