DROP TABLE IF EXISTS `geomex`.`OfferRedemption`;

CREATE TABLE IF NOT EXISTS `geomex`.`OfferRedemption` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `UserId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `TimeCreated` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientIdOfferRedemption` (`ClientId` ASC) ,
  INDEX `UserIdOfferRedemption` (`UserId` ASC) ,
  INDEX `OfferIdOfferRedemption` (`OfferId` ASC) ,
  CONSTRAINT `ClientIdOfferRedemption`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `UserIdOfferRedemption`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `OfferIdOfferRedemption`
    FOREIGN KEY (`OfferId` )
    REFERENCES `geomex`.`Offers` (`OfferId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`OfferRedemption_Datetime_Created`;

CREATE TRIGGER `geomex`.`OfferRedemption_Datetime_Created` BEFORE INSERT ON `geomex`.`OfferRedemption` 
FOR EACH ROW
SET NEW._Created = NOW();
