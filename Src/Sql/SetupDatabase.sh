#!/bin/bash
mysql -u root -pEstaTrivialDb! < 01CreatingDatabase.sql;
mysql -u root -pEstaTrivialDb! < 02ClientsTable.sql;
mysql -u root -pEstaTrivialDb! < 03LocationsTable.sql;
mysql -u root -pEstaTrivialDb! < 04UsersTable.sql;
mysql -u root -pEstaTrivialDb! < 05MessagesTable.sql;
mysql -u root -pEstaTrivialDb! < 06SentMessages.sql;