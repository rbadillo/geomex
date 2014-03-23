DROP TABLE IF EXISTS `geomex`.`OfferEvents`;

CREATE TABLE IF NOT EXISTS `geomex`.`OfferEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` BIGINT UNSIGNED NOT NULL ,
  `ClientId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `Event` VARCHAR(45) NOT NULL ,
  `Latitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `Longitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `TimeCreated` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`) ,
  INDEX `UserId_OfferEvents` (`UserId` ASC) ,
  INDEX `ClientId_OfferEvents` (`ClientId` ASC) ,
  INDEX `OfferId_OfferEvents` (`OfferId` ASC) ,
  CONSTRAINT `UserId_OfferEvents`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ClientId_OfferEvents`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `OfferId_OfferEvents`
    FOREIGN KEY (`OfferId` )
    REFERENCES `geomex`.`Offers` (`OfferId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`OfferEvents_Datetime_Created`;

CREATE TRIGGER `geomex`.`OfferEvents_Datetime_Created` BEFORE INSERT ON `geomex`.`OfferEvents` 
FOR EACH ROW
SET NEW._Created = NOW();
