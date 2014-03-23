DROP TABLE IF EXISTS `geomex`.`UserPrivateOffers`;

CREATE TABLE IF NOT EXISTS `geomex`.`UserPrivateOffers` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `UserId` BIGINT UNSIGNED NOT NULL ,
  `OfferId` INT NOT NULL ,
  `StartDate` DATETIME NOT NULL ,
  `EndDate` DATETIME NOT NULL ,
  `TimeCreated` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientIdPrivateOffers` (`ClientId` ASC) ,
  INDEX `UserIdPrivateOffers` (`UserId` ASC) ,
  INDEX `OfferIdPrivateOffers` (`OfferId` ASC) ,
  CONSTRAINT `ClientIdPrivateOffers`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `UserIdPrivateOffers`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `OfferIdPrivateOffers`
    FOREIGN KEY (`OfferId` )
    REFERENCES `geomex`.`Offers` (`OfferId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`UserPrivateOffers_Datetime_Created`;

CREATE TRIGGER `geomex`.`UserPrivateOffers_Datetime_Created` BEFORE INSERT ON `geomex`.`UserPrivateOffers` 
FOR EACH ROW
SET NEW._Created = NOW();
