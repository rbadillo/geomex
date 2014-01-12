How to Setup Environment
======

1.- Login al box

	a) geomex

2.- Login como root

	a) sudo su

3.- Cambiarse al Home Directory

	a) cd /

4.- Instalar git

	a) sudo apt-get install -y git-core

5.- Traer Repositorio Remoto

	a) git clone https://github.com/rbadillo/geomex.git

6.- Cambiarse al SetupScripts Directory

	a) cd /geomex/SetupScripts

7.- Correr el Script 01Gui.sh

	a) ./01Gui.sh


After reboot


8.- Login al box

	a) geomex

9.- Login como root

	a) sudo su

10.- Cambiarse al SetupScripts Directory

	a) cd /geomex/SetupScripts

11.- Correr el Script 02Technologies.sh

	a) ./02Technologies.sh

12.- Correr el Script 03Utils.sh

	a)  ./03Utils.sh

14.- Dejar de ser root

	a) exit

15.- Cambiarse al SetupScripts Directory

	a) cd /geomex/SetupScripts

16.- Correr el Script 04VncServer.sh (User geomex)

	a) ./04VncServer.sh

17.- Reiniciar Server

	a) sudo reboot


How to Setup Mysql Database
======

1.- Login al box

	a) geomex

2.- Login como root

	a) sudo su

3.- Cambiarse al geomex/Src/Sql Directory

	a) cd /geomex/Src/Sql

4.- Correr Script SetupDatabase.sh

	a) ./SetupDatabase.sh
	
	
How to Setup Nodejs Modules
======

1.- Login al box

	a) geomex

2.- Login como root

	a) sudo su

3.- Cambiarse al geomex/Src/Node Directory

	a) cd /geomex/Src/Node

4.- Correr Script SetupNodejs.sh

	a) ./SetupNodejs.sh
	
	
How to Export/Import Mysql Data
======

1.- Export

	a) mysqldump -u [USER] -p --skip-triggers --compact --complete-insert --no-create-info [DATABASE] > [FILE.sql]
	

2.- Import

	b) mysql -u [USER] -p [DATABASE] < [FILE.sql]
