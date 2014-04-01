echo 'EstaTrivialBox!' | sudo -S /usr/bin/forever start -l /home/geomex/Near/current/log/RouterServer.log /home/geomex/Near/current/Src/Node/RouterServer.js
/usr/bin/forever start -l /home/geomex/Near/current/log/RegisterServer.log /home/geomex/Near/current/Src/Node/RegisterServer.js
/usr/bin/forever start -l /home/geomex/Near/current/log/QueueWorker.log /home/geomex/Near/current/Src/Node/QueueWorker.js
/usr/bin/forever start -l /home/geomex/Near/current/log/MsjDispatcher.log /home/geomex/Near/current/Src/Node/MsjDispatcher.js
/usr/bin/forever start -l /home/geomex/Near/current/log/FeatureServer.log /home/geomex/Near/current/Src/Node/FeatureServer.js
/usr/bin/forever start -l /home/geomex/Near/current/log/OfferServer.log /home/geomex/Near/current/Src/Node/OfferServer.js
