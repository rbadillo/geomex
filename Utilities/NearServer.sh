echo ""
echo "Initiating RouterServer"
echo 'EstaTrivialBox!' | sudo -S forever start -a -l /home/geomex/Logs/RouterServer.log /home/geomex/Near/current/Src/Node/RouterServer.js
echo "Initiating RegisterServer"
forever start -a -l /home/geomex/Logs/RegisterServer.log /home/geomex/Near/current/Src/Node/RegisterServer.js
echo "Initiating MessagingServer"
forever start -a -l /home/geomex/Logs/MessagingServer.log /home/geomex/Near/current/Src/Node/MessagingServer.js
echo "Initiating MsjDispatcher"
forever start -a -l /home/geomex/Logs/MsgDispatcher.log /home/geomex/Near/current/Src/Node/MsgDispatcher.js
echo "Initiating FeatureServer"
forever start -a -l /home/geomex/Logs/FeatureServer.log /home/geomex/Near/current/Src/Node/FeatureServer.js
echo "Initiating OfferServer"
forever start -a -l /home/geomex/Logs/OfferServer.log /home/geomex/Near/current/Src/Node/OfferServer.js
echo ""