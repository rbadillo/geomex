#!/bin/bash 

Month=$(date +%m)
Day=$(date +%d)
Year=$(date +%Y)
FileOutput="Prod_" 
FileOutput=$FileOutput$Month"_"$Day"_"$Year".sql"
Path="/home/geomex/DbBackup/"
Path=$Path$FileOutput

mysqldump -uroot -pEstaTrivialDb! geomex > $Path
