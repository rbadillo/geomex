var express = require('express')
var app = express()
var dbReports = require('./libs/dbReports')

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')
app.use(express.logger('dev'))

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/totalUsers', function (req, res) {

  dbReports.totalUsers(function(err,rows){
  	if(err)
  	{
  		res.render('error')	
  	}
  	else
  	{
  		var totalUsers = rows[0].totalUsers
    	res.render('totalUsers', { reportTotalUsers : totalUsers})  		
  	}
  })
})

app.get('/totalUsersByGender', function (req, res) {

  dbReports.totalUsersByGender(function(err,rows){
  	if(err)
  	{
  		res.render('error')	
  	}
  	else
  	{
  		var totalUsersMale = rows[0].totalUsersMale
  		var totalUsersFemale = rows[0].totalUsersFemale
    	res.render('totalUsersByGender', { reportTotalUsersByGenderMale : totalUsersMale, 
    			reportTotalUsersByGenderFemale : totalUsersFemale })  		
  	}
  })
})

app.get('/totalUsersAppOpen', function (req, res) {

  dbReports.totalUsersAppOpen(function(err,rows,dateRange){
  	if(err)
  	{
  		res.render('error')	
  	}
  	else
  	{ 
  		var dateRange = dateRange.reverse(); 
  		var dateRangeTemp="";
  		var totalUsersAppOpen="";

  		for(var i=0;i<rows.length;i++)
  		{
  			dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
  			totalUsersAppOpen = totalUsersAppOpen +rows[i].totalOpenedApps +","
  		}

  		dateRangeTemp = dateRangeTemp.slice(0, -1);
  		totalUsersAppOpen = totalUsersAppOpen.slice(0, -1);

    	res.render('totalUsersAppOpen', { reportDateRange : dateRangeTemp, 
    			reportTotalUsersAppOpen : totalUsersAppOpen })  			
  	}
  })
})

app.get('/totalUsersAppOpenUnique', function (req, res) {

  dbReports.totalUsersAppOpenUnique(function(err,rows,dateRange){
  	if(err)
  	{
  		res.render('error')	
  	}
  	else
  	{ 

  		var dateRange = dateRange.reverse(); 
  		var dateRangeTemp="";
		  var totalUsersAppOpenUnique="";

  		for(var i=0;i<rows.length;i++)
  		{
  			dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
  			totalUsersAppOpenUnique = totalUsersAppOpenUnique +rows[i].totalOpenedAppsUnique +","
  		}

  		dateRangeTemp = dateRangeTemp.slice(0, -1);
  		totalUsersAppOpenUnique = totalUsersAppOpenUnique.slice(0, -1);

    	res.render('totalUsersAppOpenUnique', { reportDateRange : dateRangeTemp, 
    			reportTotalUsersAppOpenUnique : totalUsersAppOpenUnique })  			
  	}
  })
})

app.get('/totalUsersAppOpenByGender', function (req, res) {

  dbReports.totalUsersAppOpenByGender(function(err,rows,dateRange){
  	if(err)
  	{
  		res.render('error')	
  	}
  	else
  	{ 
  		var dateRange = dateRange.reverse(); 
  		var dateRangeTemp="";
  		var totalUsersAppOpenByMale="";
      var totalUsersAppOpenByFemale="";

  		for(var i=0;i<rows.length;i++)
  		{
  			dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
  			totalUsersAppOpenByMale = totalUsersAppOpenByMale +rows[i].totalOpenedAppsMale +","
        totalUsersAppOpenByFemale = totalUsersAppOpenByFemale +rows[i].totalOpenedAppsFemale +","
  		}

  		dateRangeTemp = dateRangeTemp.slice(0, -1);
  		totalUsersAppOpenByMale = totalUsersAppOpenByMale.slice(0, -1);
      totalUsersAppOpenByFemale = totalUsersAppOpenByFemale.slice(0, -1);

    	res.render('totalUsersAppOpenByGender', { reportDateRange : dateRangeTemp, 
    			reportTotalUsersAppOpenByMale : totalUsersAppOpenByMale,
          reportTotalUsersAppOpenByFemale : totalUsersAppOpenByFemale })  			
  	}
  })
})

app.get('/totalUsersAppOpenByGenderUnique', function (req, res) {

  dbReports.totalUsersAppOpenByGenderUnique(function(err,rows,dateRange){
    if(err)
    {
      res.render('error') 
    }
    else
    { 
      var dateRange = dateRange.reverse(); 
      var dateRangeTemp="";
      var totalUsersAppOpenByMaleUnique="";
      var totalUsersAppOpenByFemaleUnique="";

      for(var i=0;i<rows.length;i++)
      {
        dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
        totalUsersAppOpenByMaleUnique = totalUsersAppOpenByMaleUnique +rows[i].totalOpenedAppsMaleUnique +","
        totalUsersAppOpenByFemaleUnique = totalUsersAppOpenByFemaleUnique +rows[i].totalOpenedAppsFemaleUnique +","
      }

      dateRangeTemp = dateRangeTemp.slice(0, -1);
      totalUsersAppOpenByMaleUnique = totalUsersAppOpenByMaleUnique.slice(0, -1);
      totalUsersAppOpenByFemaleUnique = totalUsersAppOpenByFemaleUnique.slice(0, -1);

      res.render('totalUsersAppOpenByGenderUnique', { reportDateRange : dateRangeTemp, 
          reportTotalUsersAppOpenByMaleUnique : totalUsersAppOpenByMaleUnique,
          reportTotalUsersAppOpenByFemaleUnique : totalUsersAppOpenByFemaleUnique })        
    }
  })
})


app.listen(3000)