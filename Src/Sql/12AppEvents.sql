CREATE  TABLE `geomex`.`AppEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` INT NOT NULL ,
  `Event` VARCHAR(100) NOT NULL ,
  `TimeCreated` TIMESTAMP NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `UserId` (`UserId` ASC) ,
  CONSTRAINT `UserId`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
