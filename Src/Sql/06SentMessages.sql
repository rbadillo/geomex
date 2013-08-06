CREATE  TABLE IF NOT EXISTS `geomex`.`SentMessages` (
  `UserId` INT NOT NULL ,
  `MessageId` INT NOT NULL ,
  `TimeSent` TIMESTAMP NOT NULL ,
  INDEX `UserId_idx` (`UserId` ASC) ,
  INDEX `MessageId_idx` (`MessageId` ASC) ,
  CONSTRAINT `UserId`
    FOREIGN KEY (`UserId` )
    REFERENCES `geomex`.`users` (`UserId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `MessageId`
    FOREIGN KEY (`MessageId` )
    REFERENCES `geomex`.`messages` (`MessageId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

