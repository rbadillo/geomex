import smtplib
import datetime

print ""
print "Start: " +str(datetime.datetime.now())

print "Sending Email - Monitoring"
fromaddr = 'descubrenear@gmail.com'
toaddrs  = 'rbadillo@descubrenear.com'
subject="Near - Email Monitoring"
body = "Email Monitoring"
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


