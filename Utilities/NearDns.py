import requests
import datetime
import json

print ""
print "Start: " +str(datetime.datetime.now())

nearDomain = "descubrenear.com"

baseUrl = 'https://api.dnsimple.com/v1/domains'

headers = {'User-Agent': 'Near DNS Update Client Linux/1.0',
		 'X-DNSimple-Token':'beto_best@hotmail.com:XvNcde0DxrRkXFtlMuVbo2br7qmGflGC',
		 'Accept' : 'application/json',
		 'Content-type': 'application/json'}

try:
	r = requests.get('http://iptools.bizhat.com/ipv4.php')

	if(r.status_code == 200):
		serverPublicIp=r.text

		print "Your Server Public is: " + serverPublicIp

		r = requests.get(baseUrl, headers=headers)
		if(r.status_code == 200):
			response=json.loads(r.text)[0]
			responseDomainName = response.get('domain').get('name')
			if(responseDomainName == nearDomain):

				subDomains=['api','db','monitoring','reports']

				for sub in subDomains:

					recordDomainUrl = baseUrl+'/'+str(responseDomainName)+'/records?name='+str(sub)

					r = requests.get(recordDomainUrl, headers=headers)

					if(r.status_code == 200):
						response = 	json.loads(r.text)[0]
						responseRecordId = response.get('record').get('id')

						payload = {'record': {'content': str(serverPublicIp), 'ttl':'60'}}
						updateRecordUrl = baseUrl+'/'+str(responseDomainName)+'/records/'+str(responseRecordId)
						r = requests.put(updateRecordUrl, headers=headers,data=json.dumps(payload))

						if(r.status_code == 200):
							print "DNS Simple " +"("+str(sub)+")" +" Was Updated Successfully"
						else:
							print "Error Updating A Record " +"("+str(sub)+")" +" in DNS Simple"
					else:
						print "Error Requestion A Records " +"("+str(sub)+")"  +" For Domain in DNS Simple"
			else:
				print "Error - Domain in DNS Simple does not match descubrenear.com"
		else:
			print "Error Requesting Domains in DNS Simple"
	else:
		print "Error Requestion Public IP"
except:
	print "Error Updating DNS Simple"

print "End: " +str(datetime.datetime.now())
print ""

