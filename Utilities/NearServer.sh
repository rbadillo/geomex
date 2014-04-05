echo ""
echo "Initiating RouterServer"
echo 'EstaTrivialBox!' | sudo -S forever start -a -l /home/geomex/Logs/RouterServer.log /home/geomex/Near/current/Src/Node/RouterServer.js
echo "Initiating RegisterServer"
forever start -a -l /home/geomex/Logs/RegisterServer.log /home/geomex/Near/current/Src/Node/RegisterServer.js
echo "Initiating QueueWorker"
forever start -a -l /home/geomex/Logs/QueueWorker.log /home/geomex/Near/current/Src/Node/QueueWorker.js
echo "Initiating MsjDispatcher"
forever start -a -l /home/geomex/Logs/MsjDispatcher.log /home/geomex/Near/current/Src/Node/MsjDispatcher.js
echo "Initiating FeatureServer"
forever start -a -l /home/geomex/Logs/FeatureServer.log /home/geomex/Near/current/Src/Node/FeatureServer.js
echo "Initiating OfferServer"
forever start -a -l /home/geomex/Logs/OfferServer.log /home/geomex/Near/current/Src/Node/OfferServer.js
echo ""