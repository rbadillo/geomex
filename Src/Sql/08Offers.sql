CREATE  TABLE `geomex`.`Offers` (
  `OfferId` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `Name` VARCHAR(255) NOT NULL ,
  `Title` VARCHAR(255) NOT NULL ,
  `Subtitle` VARCHAR(255) NULL ,
  `Code` VARCHAR(255) NULL ,
  `Instructions` VARCHAR(1024) NULL ,
  `Disclaimer` VARCHAR(1024) NULL ,
  `PublishedDate` TIMESTAMP NOT NULL ,
  `StartDate` TIMESTAMP NOT NULL ,
  `EndDate` TIMESTAMP NOT NULL ,
  `ActualRedemption` INT NULL ,
  `TotalRedemption` INT NULL ,
  `MultiUse` TINYINT NULL DEFAULT 0 ,
  `Visibility` VARCHAR(45) NOT NULL ,
  `DynamicRedemptionMinutes` INT NULL ,
  `PrimaryImage` VARCHAR(255) NULL ,
  `SecondaryImage` VARCHAR(255) NULL ,
  PRIMARY KEY (`OfferId`) ,
  INDEX `ClientIdOffers` (`ClientId` ASC) ,
  CONSTRAINT `ClientIdOffers`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
