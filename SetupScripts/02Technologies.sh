#!/bin/bash
sudo apt-get install -y python-software-properties
sudo apt-get update -y
sudo apt-get install -y curl
sudo curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get update -y
sudo apt-get install -y nodejs
sudo apt-get install -y rabbitmq-server
echo mysql-server-5.5 mysql-server/root_password password EstaTrivialDb! | debconf-set-selections
echo mysql-server-5.5 mysql-server/root_password_again password EstaTrivialDb! | debconf-set-selections
sudo apt-get install -y mysql-server
sudo apt-get install -y openssh-server
sudo apt-get install -y capistrano
