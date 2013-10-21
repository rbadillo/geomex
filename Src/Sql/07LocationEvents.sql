CREATE  TABLE IF NOT EXISTS `geomex`.`LocationEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` INT NOT NULL ,
  `ClientId` INT NOT NULL ,
  `LocationId` INT NOT NULL ,
  `Event` VARCHAR(255) NOT NULL ,
  `TimeCreated` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `UserId` (`UserId` ASC) ,
  INDEX `ClientId` (`ClientId` ASC) ,
  INDEX `LocationId` (`LocationId` ASC) ,
  CONSTRAINT `UserId_LocationEvents`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ClientId_LocationEvents`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `LocationId_LocationEvents`
    FOREIGN KEY (`LocationId` )
    REFERENCES `geomex`.`Locations` (`LocationId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
