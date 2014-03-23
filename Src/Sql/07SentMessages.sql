DROP TABLE IF EXISTS `geomex`.`SentMessages`;

CREATE TABLE IF NOT EXISTS `geomex`.`SentMessages` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `UserId` BIGINT UNSIGNED NOT NULL ,
  `MessageId` INT NOT NULL ,
  `MessageRead` TINYINT NOT NULL DEFAULT 0,
  `TimeSent` DATETIME NOT NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  INDEX `UserId_idx` (`UserId` ASC) ,
  INDEX `MessageId_idx` (`MessageId` ASC) ,
  CONSTRAINT `UserId`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `MessageId`
    FOREIGN KEY (`MessageId` )
    REFERENCES `geomex`.`Messages` (`MessageId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`SentMessages_Datetime_Created`;

CREATE TRIGGER `geomex`.`SentMessages_Datetime_Created` BEFORE INSERT ON `geomex`.`SentMessages` 
FOR EACH ROW
SET NEW._Created = NOW();
