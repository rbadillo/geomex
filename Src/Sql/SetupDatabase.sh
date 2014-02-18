#!/bin/bash
mysql -u root -pEstaTrivialDb! < 01CreatingDatabase.sql;
mysql -u root -pEstaTrivialDb! < 02ClientsTable.sql;
mysql -u root -pEstaTrivialDb! < 03LocationsTable.sql;
mysql -u root -pEstaTrivialDb! < 04UsersTable.sql;
mysql -u root -pEstaTrivialDb! < 05Offers.sql;
mysql -u root -pEstaTrivialDb! < 06MessagesTable.sql;
mysql -u root -pEstaTrivialDb! < 07SentMessages.sql
mysql -u root -pEstaTrivialDb! < 08LocationEvents.sql
mysql -u root -pEstaTrivialDb! < 09UserPrivateOffers.sql
mysql -u root -pEstaTrivialDb! < 10OfferRedemption.sql
mysql -u root -pEstaTrivialDb! < 11OfferEvents.sql
mysql -u root -pEstaTrivialDb! < 12AppEvents.sql
