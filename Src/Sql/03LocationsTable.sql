CREATE  TABLE IF NOT EXISTS `geomex`.`Locations` (
  `LocationId` INT NOT NULL AUTO_INCREMENT ,
  `Name` VARCHAR(255) NOT NULL ,
  `ClientId` INT NOT NULL ,
  `Latitude` DOUBLE NOT NULL ,
  `Longitude` DOUBLE NOT NULL ,
  `Address` VARCHAR(255) NOT NULL ,
  `Country` VARCHAR(45) NOT NULL ,
  `State` VARCHAR(45) NOT NULL ,
  `City` VARCHAR(45) NOT NULL ,
  `ZipCode` VARCHAR(45) NOT NULL ,
  PRIMARY KEY (`LocationId`) ,
  INDEX `ClientId_idx` (`ClientId` ASC) ,
  CONSTRAINT `ClientId`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
