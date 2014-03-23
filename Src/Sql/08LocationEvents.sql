DROP TABLE IF EXISTS `geomex`.`LocationEvents`;

CREATE TABLE IF NOT EXISTS `geomex`.`LocationEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` BIGINT UNSIGNED NOT NULL ,
  `ClientId` INT NOT NULL ,
  `LocationId` INT NOT NULL ,
  `LocationName` VARCHAR(255) NOT NULL ,
  `Event` VARCHAR(255) NOT NULL ,
  `Latitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `Longitude` DECIMAL(10,6) NULL DEFAULT NULL, 
  `TimeCreated` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientId` (`ClientId` ASC) ,
  INDEX `LocationId` (`LocationId` ASC) ,
  INDEX `UserId_LocationEvents` (`UserId` ASC) ,
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
    
DROP TRIGGER IF EXISTS `geomex`.`LocationEvents_Datetime_Created`;

CREATE TRIGGER `geomex`.`LocationEvents_Datetime_Created` BEFORE INSERT ON `geomex`.`LocationEvents` 
FOR EACH ROW
SET NEW._Created = NOW();
