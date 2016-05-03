import requests
import smtplib
import datetime

Timeout=5

print ""
print "Start: " +str(datetime.datetime.now())

try:
	r = requests.get('http://api.descubrenear.com/HealthCheck/GetAllActiveClients',timeout=Timeout)
	Code=r.status_code
	ResponseTime=r.elapsed
	ResponseTime=str(ResponseTime).split(".")
	ResponseTime=ResponseTime[1][:-3]
	print "HTTP Code: " +str(Code)
	print "Response Time: " +str(ResponseTime) +" miliseconds"
	if(Code!=200):
		print "Sending Email - Health Check HTTP CODE Error Alert"
		fromaddr = 'descubrenear@gmail.com'
		toaddrs  = 'beto_best@hotmail.com'
		subject="Near - Health Check HTTP CODE Error Alert"
		body = "Health Check HTTP CODE Error: " +str(Code)
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

except requests.exceptions.Timeout:
	print "Sending Email - Health Check Timeout Alert"
	fromaddr = 'descubrenear@gmail.com'
	toaddrs  = 'beto_best@hotmail.com'
	subject="Near - Health Check Timeout Alert"
	body = "Health Check Exceeded Timeout of " +str(Timeout) +" seconds"
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
except requests.exceptions.ConnectionError:
	print "Sending Email - Health Check ConnectionError Alert"
	fromaddr = 'descubrenear@gmail.com'
	toaddrs  = 'beto_best@hotmail.com'
	subject="Near - Health Check ConnectionError Alert"
	body = "Health Check ConnectionError"
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

