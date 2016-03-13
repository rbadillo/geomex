#!/bin/bash
sudo python /home/geomex/Near/current/Utilities/rabbitmqadmin.py declare binding source='Near.Messaging' destination_type='queue' destination='Near.Messaging.PushMessages' routing_key='PushMessages'

