DROP TABLE IF EXISTS `geomex`.`AppEvents`;

CREATE TABLE IF NOT EXISTS `geomex`.`AppEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` BIGINT UNSIGNED NOT NULL ,
  `ClientId` INT NULL DEFAULT NULL
  `Event` VARCHAR(100) NOT NULL ,
  `Latitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `Longitude` DECIMAL(10,6) NULL DEFAULT NULL,
  `TimeCreated` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`) ,
  INDEX `UserId_AppEvent` (`UserId` ASC) ,
  INDEX `ClientId_AppEvent_idx` (`ClientId` ASC) ,
  CONSTRAINT `UserId_AppEvent`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION),
  CONSTRAINT `ClientId_AppEvent`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

DROP TRIGGER IF EXISTS `geomex`.`AppEvents_Datetime_Created`;

CREATE TRIGGER `geomex`.`AppEvents_Datetime_Created` BEFORE INSERT ON `geomex`.`AppEvents` 
FOR EACH ROW
SET NEW._Created = NOW();
