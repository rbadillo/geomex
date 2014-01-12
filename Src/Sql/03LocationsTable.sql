DROP TABLE IF EXISTS `geomex`.`Locations`;

CREATE  TABLE IF NOT EXISTS `geomex`.`Locations` (
  `LocationId` INT NOT NULL AUTO_INCREMENT ,
  `Name` VARCHAR(255) NOT NULL ,
  `ClientId` INT NOT NULL ,
  `IsActive` TINYINT NOT NULL DEFAULT 1,
  `Visibility` VARCHAR(45) NOT NULL ,
  `Latitude` DECIMAL(10,6) NOT NULL ,
  `Longitude` DECIMAL(10,6) NOT NULL ,
  `Address` VARCHAR(255) NOT NULL ,
  `Country` VARCHAR(45) NOT NULL ,
  `State` VARCHAR(45) NOT NULL ,
  `City` VARCHAR(45) NOT NULL ,
  `ZipCode` VARCHAR(45) NOT NULL ,
  `LocationPhoto` VARCHAR(255) NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LocationId`) ,
  INDEX `ClientId_idx` (`ClientId` ASC) ,
  CONSTRAINT `ClientId`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`Locations_Datetime_Created`;

CREATE TRIGGER `geomex`.`Locations_Datetime_Created` BEFORE INSERT ON `geomex`.`Locations` 
FOR EACH ROW
SET NEW._Created = NOW();
