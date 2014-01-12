DROP TABLE IF EXISTS `geomex`.`Clients` ;

CREATE  TABLE IF NOT EXISTS `geomex`.`Clients` (
  `ClientId` INT NOT NULL AUTO_INCREMENT ,
  `Name` VARCHAR(255) NOT NULL ,
  `Logo` VARCHAR(255) NULL ,
  `IsActive` TINYINT NOT NULL DEFAULT 1,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ClientId`) );

DROP TRIGGER IF EXISTS `geomex`.`Clients_Datetime_Created`;

CREATE TRIGGER `geomex`.`Clients_Datetime_Created` BEFORE INSERT ON `geomex`.`Clients` 
FOR EACH ROW
SET NEW._Created = NOW();
