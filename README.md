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
    
Modulos Nodejs
======

1.-	Object Relational Mapping (Nodejs) 

	a) sudo npm install orm
	
	b) Despues de Instalar orm, hay que instalar sus dependencias para tener el Modulo indicado para Mysql
	
	c) cd node_modules
	
	d) cd orm
	
	c) sudo npm install

2.-	Modulos para Unit Testing (Nodejs)
	
	a) npm install mocha

3.-	Modulo de Redis (Nodejs) 
	
	a) sudo npm install hiredis redis

4.-	Modulo de Express (Nodejs)
	
	a) sudo npm install express

5.-	Modulo para RabbitMQ (Nodejs)
	
	a) sudo npm install amqp

6.-	Modulo de Datetime (Nodejs)
	
	a) npm install moment

7.-	Modulo de Mysql (Nodejs)
	
	a) Este modulo se va instalar indirectamente por medio del modulo de Orm

8.-	Modulo de Apple Push Notification Service (Nodejs)
	
	a) sudo npm install apn

9.-	Modulo de Seguridad/Criptografía (Nodejs)
	
	a) Crypto (Ya viene incluido en Nodejs)

10.-	Modulo para Logs (Nodejs)
	
	a) npm install winston

11.-	Modulo de Forever (Nodejs)
	
	a) sudo npm install forever -g
