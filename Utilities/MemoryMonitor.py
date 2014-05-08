import psutil
import smtplib
import datetime
import time

i=0
SendAlert=0
CPU=0
Trigger=40.0

print ""
print "Start: " +str(datetime.datetime.now())

while i<3:
	Memory=psutil.virtual_memory()
	Memory= Memory[2]
	print "Memory Utilization: " +str(Memory) +" %"
	if(Memory>Trigger):
		SendAlert=SendAlert+1
	time.sleep(3)
	i=i+1


if(SendAlert==3):
	print "Sending Email - Memory Alert"
	fromaddr = 'descubrenear@gmail.com'
	toaddrs  = 'beto_best@hotmail.com'
	subject="Near - Memory Alert"
	body = "Memory Utilization: " +str(Memory) +" %"
	message = 'Subject: %s\n\n%s' % (subject, body)

	# Credentials (if needed)
	username = 'descubrenear'
	password = 'b3t0SaTuRn01'

	# The actual mail send
	server = smtplib.SMTP('smtp.gmail.com:587')
	server.starttls()
	server.login(username,password)
	server.sendmail(fromaddr, toaddrs, message)
	server.quit()

print "End: " +str(datetime.datetime.now())
print ""


