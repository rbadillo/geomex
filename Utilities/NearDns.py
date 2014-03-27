import urllib2
import base64
import datetime

print "#################################################################"
print "Start: " +str(datetime.datetime.now())

myurl = "near.noip.me"
username = "beto_best@hotmail.com"
password = "b3t0SaTuRn01"

web_page = urllib2.urlopen("http://iptools.bizhat.com/ipv4.php")
myip = web_page.read()


print ""
print "Your IP is " + myip

update_url = "https://dynupdate.no-ip.com/nic/update?hostname=" + myurl + "&myip=" + myip

req = urllib2.Request(update_url)
req.add_header('Authorization', 'Basic '+base64.encodestring(username+":"+password).replace("\n",""))
req.add_header('User-Agent', 'Near Update Client Linux/1.0  descubrenear@gmail.com')
resp = urllib2.urlopen(req)
content = resp.read()
print content

print ""
print "End: " +str(datetime.datetime.now())
print ""