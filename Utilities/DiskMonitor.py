import psutil
import smtplib
import datetime

Trigger=85.0

print ""
print "Start: " +str(datetime.datetime.now())

DiskUsed=psutil.disk_usage('/')
DiskPercentage=DiskUsed[3]
print "Disk Space Used: " +str(DiskPercentage) +" %"

if(DiskPercentage>Trigger):
	print "Sending Email - Disk Alert"
	fromaddr = 'descubrenear@gmail.com'
	toaddrs  = 'beto_best@hotmail.com'
	subject="Near - Disk Alert"
	body = "Disk Space Used: " +str(DiskPercentage) +" %"
	message = 'Subject: %s\n\n%s' % (subject, body)

	# Credentials (if needed)
	username = 'descubrenear'
	password = 'badillogonzalez'

	# The actual mail send
	server = smtplib.SMTP('smtp.gmail.com:587')
	server.starttls()
	server.login(username,password)
	server.sendmail(fromaddr, toaddrs, message)
	server.quit()

print "End: " +str(datetime.datetime.now())
print ""
