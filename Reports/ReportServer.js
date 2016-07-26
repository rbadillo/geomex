var express = require('express')
var app = express()
var morgan = require('morgan');
var dbReports = require('./libs/dbReports')

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time'));
app.set('port', 2000);

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/internalReports', function (req, res) {
  res.render('internalReports')
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

app.get('/totalUsersByDevice', function (req, res) {

  dbReports.totalUsersByDevice(function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalUsersIos = rows[0].totalUsersIos
      var totalUsersandroid= rows[0].totalUsersAndroid
      res.render('totalUsersByDevice', { reportTotalUsersByDeviceIos : totalUsersIos, 
          reportTotalUsersByDeviceAndroid : totalUsersandroid })      
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

app.get('/usersDetails', function (req, res) {

  dbReports.usersDetails(function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var usersDetails = rows
      res.render('usersDetails', { reportUsersDetails : usersDetails})      
    }
  })
})

app.get('/usersRedemptions', function (req, res) {

  dbReports.usersRedemptions(function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var usersRedemptions = rows
      res.render('usersRedemptions', { reportUsersRedemptions : usersRedemptions})      
    }
  })
})

app.get('/clientReportIndex', function (req, res) {

  dbReports.clientReports(function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {

      var clientIds = ""
      var clientNames = ""

      for(var i=0; i<rows.length;i++)
      {
        clientIds = clientIds +rows[i].ClientId +","
        clientNames = clientNames +"'" +rows[i].Name.replace(/'/g, "\\'") +"'" +","
      }

      clientIds = clientIds.slice(0, -1);
      clientNames = clientNames.slice(0, -1);

      clientIds = clientIds.split(",");
      clientNames = clientNames.split(",");

      res.render('clientReportIndex', { reportClientIds : clientIds,
          reportClientNames : clientNames
        })      
    }
  })
})

app.get('/clientReport/:clientId', function (req, res) {
  var clientId = req.params.clientId
  res.render('clientReport', { reportClientId : clientId })
})

app.get('/clientReport/:clientId/totalClicks', function (req, res) {
  var clientId = req.params.clientId

  dbReports.clientReportTotalClicks(clientId, function(err,rows,dateRange){

    if(err)
    {
      res.render('error') 
    }
    else
    { 
      var dateRange = dateRange.reverse(); 
      var dateRangeTemp="";
      var totalClicks="";

      for(var i=0;i<rows.length;i++)
      {
        dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
        totalClicks = totalClicks +rows[i].totalClicks +","
      }

      dateRangeTemp = dateRangeTemp.slice(0, -1);
      totalClicks = totalClicks.slice(0, -1);

      res.render('clientReportTotalClicks', { reportDateRange : dateRangeTemp, 
          reportTotalClicks : totalClicks })        
    }
  })
})

app.get('/clientReport/:clientId/totalClicksUnique', function (req, res) {
  var clientId = req.params.clientId

  dbReports.clientReportTotalClicksUnique(clientId, function(err,rows,dateRange){

    if(err)
    {
      res.render('error') 
    }
    else
    { 
      var dateRange = dateRange.reverse(); 
      var dateRangeTemp="";
      var totalClicksUnique="";

      for(var i=0;i<rows.length;i++)
      {
        dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
        totalClicksUnique = totalClicksUnique +rows[i].totalClicksUnique +","
      }

      dateRangeTemp = dateRangeTemp.slice(0, -1);
      totalClicksUnique = totalClicksUnique.slice(0, -1);

      res.render('clientReportTotalClicksUnique', { reportDateRange : dateRangeTemp, 
          reportTotalClicksUnique : totalClicksUnique })        
    }
  })
})

app.get('/clientReport/:clientId/totalClicksByGender', function (req, res) {
  var clientId = req.params.clientId

  dbReports.clientReportTotalClicksByGender(clientId, function(err,rows,dateRange){
    if(err)
    {
      res.render('error') 
    }
    else
    { 
      var dateRange = dateRange.reverse(); 
      var dateRangeTemp="";
      var totalClicksByMale="";
      var totalClicksByFemale="";

      for(var i=0;i<rows.length;i++)
      {
        dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
        totalClicksByMale = totalClicksByMale +rows[i].totalClicksMale +","
        totalClicksByFemale = totalClicksByFemale +rows[i].totalClicksFemale +","
      }

      dateRangeTemp = dateRangeTemp.slice(0, -1);
      totalClicksByMale = totalClicksByMale.slice(0, -1);
      totalClicksByFemale = totalClicksByFemale.slice(0, -1);

      res.render('clientReportTotalClicksByGender', { reportDateRange : dateRangeTemp, 
          reportTotalClicksByMale : totalClicksByMale,
          reportTotalClicksyFemale : totalClicksByFemale })        
    }
  })
})

app.get('/clientReport/:clientId/totalClicksByGenderUnique', function (req, res) {
  var clientId = req.params.clientId

  dbReports.clientReportTotalClicksByGenderUnique(clientId, function(err,rows,dateRange){
    if(err)
    {
      res.render('error') 
    }
    else
    { 
      var dateRange = dateRange.reverse(); 
      var dateRangeTemp="";
      var totalClicksByMaleUnique="";
      var totalClicksByFemaleUnique="";

      for(var i=0;i<rows.length;i++)
      {
        dateRangeTemp = dateRangeTemp +"'" +dateRange[i] +"'" +","
        totalClicksByMaleUnique = totalClicksByMaleUnique +rows[i].totalClicksMaleUnique +","
        totalClicksByFemaleUnique = totalClicksByFemaleUnique +rows[i].totalClicksFemaleUnique +","
      }

      dateRangeTemp = dateRangeTemp.slice(0, -1);
      totalClicksByMaleUnique = totalClicksByMaleUnique.slice(0, -1);
      totalClicksByFemaleUnique = totalClicksByFemaleUnique.slice(0, -1);

      res.render('clientReportTotalClicksByGenderUnique', { reportDateRange : dateRangeTemp, 
          reportTotalClicksByMaleUnique : totalClicksByMaleUnique,
          reportTotalClicksyFemaleUnique : totalClicksByFemaleUnique })        
    }
  })
})

app.get('/clientReport/:clientId/offerReport', function (req, res) {

  var clientId = req.params.clientId

  dbReports.clientOffers(clientId, function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var clientOffers = "";
      var clientOffersTitle = "";
      var clientOffersSubtitle = "";

      for(var i=0;i<rows.length;i++)
      {
        clientOffers = clientOffers +rows[i].OfferId +","
        clientOffersTitle = clientOffersTitle +"'" +rows[i].Title +"'" +","
        clientOffersSubtitle = clientOffersSubtitle +"'"  +rows[i].Subtitle +"'" +","
      }

      clientOffers = clientOffers.slice(0,-1);
      clientOffersTitle = clientOffersTitle.slice(0,-1);
      clientOffersSubtitle = clientOffersSubtitle.slice(0,-1);

      res.render('clientOffers',{ reportClientId: clientId, reportClientOffers: clientOffers, 
        reportClientOffersTitle: clientOffersTitle, reportClientOffersSubtitle: clientOffersSubtitle })      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  res.render('offerReport', { reportClientId : clientId, reportOfferId : offerId })

})

app.get('/clientReport/:clientId/offerReport/:offerId/totalViews', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalViews(clientId, offerId, function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalViews = rows[0].totalViews
      res.render('offerReportTotalViews', {reportTotalViews: totalViews})      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalViewsUnique', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalViewsUnique(clientId, offerId, function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalViewsUnique = rows[0].totalViewsUnique
      res.render('offerReportTotalViewsUnique', {reportTotalViewsUnique: totalViewsUnique})      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalViewsByGender', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalViewsByGender(clientId,offerId,function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalViewsByMale = rows[0].totalViewsByMale
      var totalViewsByFemale = rows[0].totalViewsByFemale
      res.render('offerReportTotalViewsByGender', { reportTotalViewsByGenderMale : totalViewsByMale, 
          reportTotalViewsByGenderFemale : totalViewsByFemale })      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalViewsByGenderUnique', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalViewsByGenderUnique(clientId,offerId,function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalViewsByMaleUnique = rows[0].totalViewsByMaleUnique
      var totalViewsByFemaleUnique = rows[0].totalViewsByFemaleUnique
      res.render('offerReportTotalViewsByGenderUnique', { reportTotalViewsByGenderMaleUnique : totalViewsByMaleUnique, 
          reportTotalViewsByGenderFemaleUnique : totalViewsByFemaleUnique })      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalRedemptions', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalRedemptions(clientId, offerId, function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalRedemptions = rows[0].totalRedemptions
      res.render('offerReportTotalRedemptions', {reportTotalRedemptions: totalRedemptions})      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalRedemptionsUnique', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalRedemptionsUnique(clientId, offerId, function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalRedemptionsUnique = rows[0].totalRedemptionsUnique
      res.render('offerReportTotalRedemptionsUnique', {reportTotalRedemptionsUnique: totalRedemptionsUnique})      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalRedemptionsByGender', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalRedemptionsByGender(clientId,offerId,function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalRedemptionsByMale = rows[0].totalRedemptionsByMale
      var totalRedemptionsByFemale = rows[0].totalRedemptionsByFemale
      res.render('offerReportTotalRedemptionsByGender', { reportTotalRedemptionsByGenderMale : totalRedemptionsByMale, 
          reportTotalRedemptionsByGenderFemale : totalRedemptionsByFemale })      
    }
  })
})

app.get('/clientReport/:clientId/offerReport/:offerId/totalRedemptionsByGenderUnique', function (req, res) {

  var clientId = req.params.clientId
  var offerId = req.params.offerId

  dbReports.offerReportTotalRedemptionsByGenderUnique(clientId,offerId,function(err,rows){
    if(err)
    {
      res.render('error') 
    }
    else
    {
      var totalRedemptionsByMaleUnique = rows[0].totalRedemptionsByMaleUnique
      var totalRedemptionsByFemaleUnique = rows[0].totalRedemptionsByFemaleUnique
      res.render('offerReportTotalRedemptionsByGenderUnique', { reportTotalRedemptionsByGenderMaleUnique : totalRedemptionsByMaleUnique, 
          reportTotalRedemptionsByGenderFemaleUnique : totalRedemptionsByFemaleUnique })      
    }
  })
})

app.listen(app.get('port'));

console.log("Report Server - Listening Port: " +app.get('port'));

