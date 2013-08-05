Proyecto GeoMex
======

1.- Instalar Ubuntu Server 12.04.2 LTS X64

2.- Instalar Interfaz Gráfica
  
    a) sudo apt-get update
  
    b) sudo apt-get upgrade
  
    c) sudo apt-get install ubuntu-desktop
    
3.- Instalar Git

    a) sudo apt-get install git-core

4.- Instalar Nodejs
	
    a) sudo apt-get install python-software-properties
	
    b) sudo add-apt-repository ppa:chris-lea/node.js
	
    c) sudo apt-get update
	
    d) sudo apt-get install nodejs

5.- Instalar RabbitMQ
	
    a) sudo apt-get install rabbitmq-server

6.- Instalar Mysql
	
    a) sudo apt-get install mysql-server

7.- Instalar SSH Server
	
    a) sudo apt-get install openssh-server

8.- Habilitar Vino-Server
	
    a) gsettings set org.gnome.Vino enabled true
	
    b) gsettings set org.gnome.Vino prompt-enabled false
	
    c) /usr/lib/vino/vino-server
  
9.- Instalar Vmware Tools

    a) sudo apt-get install build-essential
	
    b) sudo apt-get install linux-headers-`uname -r`
	
    c) Montar Vmware Tools (Reinstall Vmware Tools)
	
    d) Copiar VMwareTools tar ball al Desktop
	
    e) Extract here
	
    f) cd vmware-tools-distrib
	
    h) sudo ./vmware-install.pl

	  Directorios Compartidos en:  /mnt/hgfs/ 

10.- Instalar Google Chrome
	
    a) wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
	
    b) sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
	
    c) sudo apt-get update
	
    d) sudo apt-get install google-chrome-stable

11.- Install Mysql Workbench
	
    a) sudo apt-get install mysql-workbench


12.- Instalar Sublime Text 2
	
    a) sudo add-apt-repository ppa:webupd8team/sublime-text-2
	
    b) sudo apt-get update
	
    c) sudo apt-get install sublime-text
    
   
13.- Instalar Redis Server

    a) sudo apt-get install redis-server
    
