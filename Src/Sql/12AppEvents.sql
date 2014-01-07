CREATE  TABLE `geomex`.`AppEvents` (
  `Id` INT NOT NULL AUTO_INCREMENT ,
  `UserId` INT NOT NULL ,
  `Event` VARCHAR(100) NOT NULL ,
  `TimeCreated` TIMESTAMP NULL ,
  PRIMARY KEY (`Id`) ,
  INDEX `UserId_AppEvents` (`UserId` ASC) ,
  CONSTRAINT `UserId`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`Users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
