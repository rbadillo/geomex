CREATE  TABLE `geomex`.`UserPrivateOffers` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `UserId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `StartDate` DATETIME NOT NULL ,
  `EndDate` DATETIME NOT NULL ,
  `TimeCreated` DATETIME NOT NULL ,
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
