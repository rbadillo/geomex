import psutil
import smtplib
import datetime

i=0
SendAlert=0
CPU=0
Trigger=35.0

print ""
print "Start: " +str(datetime.datetime.now())

while i<3:
	CPU=psutil.cpu_percent(interval=3)
	print "CPU Utilization: " +str(CPU) +" %"
	if(CPU>Trigger):
		SendAlert=SendAlert+1
	i=i+1


if(SendAlert==3):
	print "Sending Email Alert"
	fromaddr = 'descubrenear@gmail.com'
	toaddrs  = 'beto_best@hotmail.com'
	subject="Near Alert"
	body = "CPU Utilization: " +str(CPU) +" %"
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


