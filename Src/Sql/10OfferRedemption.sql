CREATE  TABLE `geomex`.`OfferRedemption` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `UserId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `TimeCreated` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientIdOfferRedemption` (`ClientId` ASC) ,
  INDEX `UserIdOfferRedemption` (`UserId` ASC) ,
  INDEX `OfferIdOfferRedemption` (`OfferId` ASC) ,
  CONSTRAINT `ClientIdOfferRedemption`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`Clients` )
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
