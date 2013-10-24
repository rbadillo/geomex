CREATE  TABLE `geomex`.`Offers` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `ClientId` INT NOT NULL ,
  `Name` VARCHAR(255) NOT NULL ,
  `Title` VARCHAR(255) NOT NULL ,
  `Subtitle` VARCHAR(255) NULL ,
  `PublishedDate` TIMESTAMP NOT NULL ,
  `StartDate` TIMESTAMP NOT NULL ,
  `EndDate` TIMESTAMP NOT NULL ,
  `ActualRedemption` INT NULL ,
  `TotalRedemption` INT NULL ,
  `MultiUse` BIT NULL DEFAULT 0 ,
  `Visibility` VARCHAR(45) NOT NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `ClientIdOffers` (`ClientId` ASC) ,
  CONSTRAINT `ClientIdOffers`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
