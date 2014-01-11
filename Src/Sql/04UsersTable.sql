CREATE  TABLE IF NOT EXISTS `geomex`.`Users` (
  `UserId` INT NOT NULL ,
  `DeviceToken` VARCHAR(255) NULL ,
  `PhoneType` VARCHAR(50) NOT NULL ,
  `IsActive` TINYINT NOT NULL DEFAULT 1 
  `FbName` VARCHAR(100) NULL ,
  `FbLastName` VARCHAR(100) NULL ,
  `FbAge` INT NULL ,
  `FbBirthday` VARCHAR(50) NULL ,
  `FbEmail` VARCHAR(100) NULL ,
  `FbGender` VARCHAR(50) NULL ,
  `FbSchool` VARCHAR(255) NULL ,
  `FbWork` VARCHAR(255) NULL ,
  `FbLink` VARCHAR(255) NULL ,
  `FbPhoto` VARCHAR(255) NULL ,
  PRIMARY KEY (`UserId`) );

