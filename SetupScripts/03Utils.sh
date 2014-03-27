#!/bin/bash
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable
sudo apt-get install -y mysql-workbench
sudo add-apt-repository -y ppa:webupd8team/sublime-text-2
sudo apt-get update 
sudo apt-get install -y sublime-text
sudo apt-get install -y python-mysqldb
