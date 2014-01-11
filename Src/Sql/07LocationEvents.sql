CREATE  TABLE IF NOT EXISTS `geomex`.`LocationEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` INT NOT NULL ,
  `ClientId` INT NOT NULL ,
  `LocationId` INT NOT NULL ,
  `LocationName` VARCHAR(255) NOT NULL ,
  `Event` VARCHAR(255) NOT NULL ,
  `Latitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `Longitude` DECIMAL(10,6) NULL DEFAULT NULL, 
  `TimeCreated` DATETIME NOT NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientId` (`ClientId` ASC) ,
  INDEX `LocationId` (`LocationId` ASC) ,
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
