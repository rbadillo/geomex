CREATE  TABLE IF NOT EXISTS `geomex`.`Messages` (
  `MessageId` INT NOT NULL AUTO_INCREMENT ,
  `Message` VARCHAR(255) NOT NULL ,
  `LocationId` INT NOT NULL ,
  `ClientId` INT NOT NULL ,
  `TimeCreated` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`MessageId`) ,
  INDEX `LocationId_idx` (`LocationId` ASC) ,
  INDEX `ClientId_idx` (`ClientId` ASC) ,
  CONSTRAINT `LocationId2`
    FOREIGN KEY (`LocationId` )
    REFERENCES `geomex`.`locations` (`LocationId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ClientId2`
    FOREIGN KEY (`ClientId` )
    REFERENCES `geomex`.`clients` (`ClientId` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

