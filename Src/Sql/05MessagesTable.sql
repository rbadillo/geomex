DROP TABLE IF EXISTS `geomex`.`Messages`;

CREATE TABLE IF NOT EXISTS `geomex`.`Messages` (
  `MessageId` INT NOT NULL AUTO_INCREMENT ,
  `Message` VARCHAR(255) NOT NULL ,
  `LocationId` INT NOT NULL ,
  `ClientId` INT NOT NULL ,
  `Visibility` VARCHAR(100) NOT NULL ,
  `TimeCreated` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MessageId`) ,
  INDEX `LocationId_idx` (`LocationId` ASC) ,
  INDEX `ClientId_idx` (`ClientId` ASC) ,
  CONSTRAINT `LocationId2`
    FOREIGN KEY (`LocationId` )
    REFERENCES `geomex`.`Locations` (`LocationId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ClientId2`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`Messages_Datetime_Created`;

CREATE TRIGGER `geomex`.`Messages_Datetime_Created` BEFORE INSERT ON `geomex`.`Messages` 
FOR EACH ROW
SET NEW._Created = NOW();
