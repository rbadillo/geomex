#!/bin/bash
sudo apt-get install -y python-software-properties
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update -y
sudo apt-get install -y nodejs
sudo apt-get install -y rabbitmq-server
sudo apt-get install -y mysql-server
sudo apt-get install -y openssh-server
gsettings set org.gnome.Vino enabled true
gsettings set org.gnome.Vino prompt-enabled false
/usr/lib/vino/vino-server
