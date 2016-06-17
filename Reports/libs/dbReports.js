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

