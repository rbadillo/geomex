import MySQLdb
import datetime
from random import randint

print ""
print "Start: " +str(datetime.datetime.now())

# Open database connection
db = MySQLdb.connect("localhost","root","EstaTrivialDb!","geomex" )

# Prepare a cursor object using cursor() method
cursor = db.cursor()

# Execute SQL query using execute() method.
cursor.execute("SELECT ClientId from Clients where IsActive=1 and ActiveOffers > 0")

# Fetch a single row using fetchone() method.
ClientIds = cursor.fetchall()

# Number of Active Clients
ActiveClients = len(ClientIds)

# Generate Random Numbers
randomNumbers = []
while len(randomNumbers) < ActiveClients:
	randomInt = randint(1,ActiveClients)
	if randomInt not in randomNumbers:
		randomNumbers.append(randomInt)
		
# Create a based dictionary to populate Clients Table.
Utility={}
Index=0
for client in ClientIds:
	Utility[int(client[0])]=randomNumbers[Index]
	Index = Index + 1

# Update Database
baseQuery = "Update Clients SET Priority=%s WHERE ClientId=%s"
for client in ClientIds:
	Priority=str(Utility[int(client[0])])
	clientId = str(client[0])
	query = baseQuery % (Priority,clientId)
	print query
	
	# Execute SQL query using execute() method.
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