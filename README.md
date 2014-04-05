How to Setup Environment
======

1.- Login al box

	geomex

2.- Login como root

	sudo su

3.- Cambiarse al Home Directory

	cd /

4.- Update al Server

	sudo apt-get update
	
5.- Instalar git

	sudo apt-get install -y git-core
	
6.- Create Base Directories

	cd ~
	mkdir Near
	mkdir DbBackup
	mkdir Logs

6.- Traer Repositorio Remoto

	cd Near/
	git clone https://github.com/rbadillo/geomex.git
	mv geomex/ current/

7.- Cambiarse al SetupScripts Directory

	cd /current/SetupScripts

7.- Correr el Script 01Gui.sh

	./01Gui.sh


After reboot


8.- Login al box

	geomex

9.- Login como root

	sudo su

10.- Cambiarse al SetupScripts Directory

	cd /current/SetupScripts

11.- Correr el Script 02Technologies.sh

	./02Technologies.sh

12.- Correr el Script 03Utils.sh

	./03Utils.sh

14.- Dejar de ser root

	exit

15.- Cambiarse al SetupScripts Directory

	cd /current/SetupScripts

16.- Correr el Script 04VncServer.sh (User geomex)

	./04VncServer.sh

17.- Reiniciar Server

	sudo reboot


How to Setup Mysql Database
======

1.- Login al box

	geomex

2.- Login como root

	sudo su

3.- Cambiarse al current/Src/Sql Directory

	cd /current/Src/Sql

4.- Correr Script SetupDatabase.sh

	./SetupDatabase.sh
	
	
How to Setup Nodejs Modules
======

1.- Login al box

	geomex

2.- Login como root

	sudo su

3.- Cambiarse al current/Src/Node Directory

	cd /current/Src/Node

4.- Correr Script SetupNodejs.sh

	./SetupNodejs.sh
	
	
How to Export/Import Mysql Database
======

1.- Export

	mysqldump -u [USER] -p [DATABASE] > [FILE.sql]
	
2.- Copy SQL File to remote server.

	scp [FILE.sql] [USER]@[REMOTEHOST]:/some/remote/directory

3.- Import

	mysql -u [USER] -p [DATABASE] < [FILE.sql]
	
Note: Data Only - Insert Statements

	mysqldump -u [USER] -p --skip-triggers --compact --complete-insert --no-create-info [DATABASE] > [FILE.sql]
