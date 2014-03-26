DROP TABLE IF EXISTS `geomex`.`Users`;

CREATE  TABLE IF NOT EXISTS `geomex`.`Users` (
  `UserId` BIGINT UNSIGNED NOT NULL ,
  `DeviceToken` VARCHAR(255) NULL ,
  `PhoneType` VARCHAR(50) NOT NULL ,
  `Timezone` VARCHAR(10) NOT NULL ,
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
  `_Created` DATETIME NOT NULL ,
  `_Updated` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`) );

DROP TRIGGER IF EXISTS `geomex`.`Users_Datetime_Created`;

CREATE TRIGGER `geomex`.`Users_Datetime_Created` BEFORE INSERT ON `geomex`.`Users` 
FOR EACH ROW
SET NEW._Created = NOW();
