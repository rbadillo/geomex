DROP TABLE IF EXISTS `geomex`.`Offers`;

CREATE  TABLE IF NOT EXISTS `geomex`.`Offers` (
  `OfferId` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `Name` VARCHAR(255) NOT NULL ,
  `Title` VARCHAR(255) NOT NULL ,
  `Subtitle` VARCHAR(255) NULL ,
  `Code` VARCHAR(255) NULL ,
  `Instructions` VARCHAR(1024) NULL ,
  `Disclaimer` VARCHAR(1024) NULL ,
  `PublishedDate` DATETIME NOT NULL ,
  `StartDate` DATETIME NOT NULL ,
  `EndDate` DATETIME NOT NULL ,
  `IsActive` TINYINT NOT NULL DEFAULT 1
  `Priority` INT NULL ,
  `ActualRedemption` INT NULL ,
  `TotalRedemption` INT NULL ,
  `MultiUse` TINYINT NOT NULL DEFAULT 0 ,
  `Visibility` VARCHAR(45) NOT NULL ,
  `DynamicRedemptionMinutes` INT NULL ,
  `PrimaryImage` VARCHAR(255) NULL ,
  `SecondaryImage` VARCHAR(255) NULL ,
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`OfferId`) ,
  INDEX `ClientIdOffers` (`ClientId` ASC) ,
  CONSTRAINT `ClientIdOffers`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TRIGGER IF EXISTS `geomex`.`Offers_Datetime_Created`;

CREATE TRIGGER `geomex`.`Offers_Datetime_Created` BEFORE INSERT ON `geomex`.`Offers` 
FOR EACH ROW
SET NEW._Created = NOW();
