Proyecto GeoMex
======

How to Setup Environment

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

6.- Cambiarse al setupScripts Directory

	a) cd /geomex/setupScripts

7.- Correr el 01Gui.sh

	a) ./01Gui.sh


After reboot


8.- Login al box

	a) geomex

9.- Login como root

	a) sudo su

10.- Cambiarse al setupScripts Directory

	a) cd /geomex/setupScripts

11.- Correr el 02Technologies.sh

	a) ./02Technologies.sh

12.- Correr el 03Utils.sh

	a)  ./03Utils.sh

14.- Dejar de ser root

	a) exit

15.- Cambiarse al setupScripts Directory

	a) cd /geomex/setupScripts

16.- Correr el 04VncServer.sh (User geomex)

	a) ./04VncServer.sh

17.- Reiniciar Server

	a) sudo reboot
