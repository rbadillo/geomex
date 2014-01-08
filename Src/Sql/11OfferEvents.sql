CREATE  TABLE `geomex`.`OfferEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` INT NOT NULL ,
  `ClientId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `Event` VARCHAR(45) NOT NULL ,
  `Latitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `Longitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `TimeCreated` TIMESTAMP NULL ,
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
