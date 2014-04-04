echo 'EstaTrivialBox!' | sudo -S forever start -a -l /home/geomex/Logs/RouterServer.log /home/geomex/Near/current/Src/Node/RouterServer.js
forever start -a -l /home/geomex/Logs/RegisterServer.log /home/geomex/Near/current/Src/Node/RegisterServer.js
forever start -a -l /home/geomex/Logs/QueueWorker.log /home/geomex/Near/current/Src/Node/QueueWorker.js
forever start -a -l /home/geomex/Logs/MsjDispatcher.log /home/geomex/Near/current/Src/Node/MsjDispatcher.js
forever start -a -l /home/geomex/Logs/FeatureServer.log /home/geomex/Near/current/Src/Node/FeatureServer.js
forever start -a -l /home/geomex/Logs/OfferServer.log /home/geomex/Near/current/Src/Node/OfferServer.js
