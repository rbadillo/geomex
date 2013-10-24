CREATE  TABLE `geomex`.`OfferRedemption` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `UserId` INT NOT NULL ,
  `OfferId` INT NOT NULL ,
  `TimeCreated` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientIdSingleUse` (`ClientId` ASC) ,
  INDEX `UserIdSingleUse` (`UserId` ASC) ,
  INDEX `OfferIdSingleUse` (`Id` ASC) ,
  CONSTRAINT `ClientIdSingleUse`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`ClientId` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `UserIdSingleUse`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `OfferIdSingleUse`
    FOREIGN KEY (`Id` )
    REFERENCES `geomex`.`Offers` (`Id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
