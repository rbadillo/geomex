CREATE  TABLE `geomex`.`UserPrivateOffers` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `StartDate` TIMESTAMP NOT NULL ,
  `EndDate` TIMESTAMP NOT NULL ,
  `TimeCreated` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `UserIdPrivateOffers` (`UserId` ASC) ,
  INDEX `OfferIdPrivateOffers` (`OfferId` ASC) ,
  CONSTRAINT `UserIdPrivateOffers`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `OfferIdPrivateOffers`
    FOREIGN KEY (`OfferId` )
    REFERENCES `geomex`.`Offers` (`Id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
