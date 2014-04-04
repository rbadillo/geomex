echo 'EstaTrivialBox!' | sudo -S /usr/bin/forever start -a -l /home/geomex/Logs/RouterServer.log /home/geomex/Near/current/Src/Node/RouterServer.js
/usr/bin/forever start -a -l /home/geomex/Logs/RegisterServer.log /home/geomex/Near/current/Src/Node/RegisterServer.js
/usr/bin/forever start -a -l /home/geomex/Logs/QueueWorker.log /home/geomex/Near/current/Src/Node/QueueWorker.js
/usr/bin/forever start -a -l /home/geomex/Logs/MsjDispatcher.log /home/geomex/Near/current/Src/Node/MsjDispatcher.js
/usr/bin/forever start -a -l /home/geomex/Logs/FeatureServer.log /home/geomex/Near/current/Src/Node/FeatureServer.js
/usr/bin/forever start -a -l /home/geomex/Logs/OfferServer.log /home/geomex/Near/current/Src/Node/OfferServer.js
