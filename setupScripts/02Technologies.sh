#!/bin/bash
sudo apt-get install -y python-software-properties
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update -y
sudo apt-get install -y nodejs=0.10.15-1chl1~precise1
sudo apt-get install -y rabbitmq-server
echo mysql-server-5.5 mysql-server/root_password password EstaTrivialDb! | debconf-set-selections
echo mysql-server-5.5 mysql-server/root_password_again password EstaTrivialDb! | debconf-set-selections
sudo apt-get install -y mysql-server
sudo apt-get install -y openssh-server
