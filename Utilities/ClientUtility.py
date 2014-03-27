import MySQLdb
import datetime

print "#################################################################"
print "Start: " +str(datetime.datetime.now())

# Open database connection
db = MySQLdb.connect("localhost","root","EstaTrivialDb!","geomex" )

# prepare a cursor object using cursor() method
cursor = db.cursor()

# execute SQL query using execute() method.
cursor.execute("SELECT ClientId from Clients where IsActive=1")

# Fetch a single row using fetchone() method.
ClientIds = cursor.fetchall()

# Create a based dictionary to populate Clients Table.
Utility={}
for client in ClientIds:
	Utility[client[0]]={"ActiveOffers":"","OfferClosestExpiration":""}


# Calculate Max EndDate
MaxEndDate=datetime.datetime.utcnow()
for client in ClientIds:
	UTC_Time=datetime.datetime.utcnow()
	query="SELECT OfferId,StartDate,EndDate from Offers where IsActive=1 and ClientId=%s and PublishedDate <= '%s' and '%s' <= EndDate" %(client[0],UTC_Time,UTC_Time)
	cursor.execute(query)
	TmpClient = cursor.fetchall()
	if(len(TmpClient)):
		if(TmpClient[0][2]>MaxEndDate):
			MaxEndDate=TmpClient[0][2]

print ""
print "MaxEndDate: " +str(MaxEndDate)
print ""

# Populate Utility Dictionary
for client in ClientIds:
	UTC_Time=datetime.datetime.utcnow()
	query="SELECT OfferId,StartDate,EndDate from Offers where IsActive=1 and ClientId=%s and PublishedDate <= '%s' and '%s' <= EndDate" %(client[0],UTC_Time,UTC_Time)
	cursor.execute(query)
	TmpClient = cursor.fetchall()
	print "ClientId: " +str(client[0])
	print "ActiveOffers: " +str(len(TmpClient))
	Utility[client[0]]["ActiveOffers"]=len(TmpClient)
	if(len(TmpClient)):
		print "OfferClosestExpiration: " +str(TmpClient[0][2])
		Utility[client[0]]["OfferClosestExpiration"]=TmpClient[0][2]
	else:
		print "OfferClosestExpiration MaxEndDate: " +str(MaxEndDate)
		Utility[client[0]]["OfferClosestExpiration"]=MaxEndDate
	print ""


#Update Clients Table
for client in ClientIds:
	query="UPDATE Clients SET ActiveOffers=%s,OfferClosestExpiration='%s' WHERE ClientId=%s" %(Utility[client[0]]["ActiveOffers"],Utility[client[0]]["OfferClosestExpiration"],client[0])
	print query
	print ""
	try:
		cursor.execute(query)
		db.commit()
	except:
		print "Rolling back - Database Error - ClientId: " +str(client[0])
		print ""
		db.rollback()

# disconnect from server
db.close()

print "End: " +str(datetime.datetime.now())
print ""