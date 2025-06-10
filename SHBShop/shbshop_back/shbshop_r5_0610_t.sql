-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: shbshop
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminacc`
--

DROP TABLE IF EXISTS `adminacc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminacc` (
  `aid` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `acc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`aid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth4cfpw`
--

DROP TABLE IF EXISTS `auth4cfpw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth4cfpw` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth4cjoin`
--

DROP TABLE IF EXISTS `auth4cjoin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth4cjoin` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth4cur`
--

DROP TABLE IF EXISTS `auth4cur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth4cur` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth4pfpw`
--

DROP TABLE IF EXISTS `auth4pfpw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth4pfpw` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth4pjoin`
--

DROP TABLE IF EXISTS `auth4pjoin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth4pjoin` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth4pur`
--

DROP TABLE IF EXISTS `auth4pur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth4pur` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cbasket2c`
--

DROP TABLE IF EXISTS `cbasket2c`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cbasket2c` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `bid` bigint NOT NULL,
  `sellerid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_commercial_TO_cbasket2c_1` (`cid`),
  KEY `FK_cbooktrade_TO_cbasket2c_1` (`bid`),
  KEY `FK_cbooktrade_TO_cbasket2c_2` (`sellerid`),
  CONSTRAINT `FK_cbooktrade_TO_cbasket2c_1` FOREIGN KEY (`bid`) REFERENCES `cbooktrade` (`bid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_cbooktrade_TO_cbasket2c_2` FOREIGN KEY (`sellerid`) REFERENCES `cbooktrade` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_commercial_TO_cbasket2c_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cbasket2p`
--

DROP TABLE IF EXISTS `cbasket2p`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cbasket2p` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `bid` bigint NOT NULL,
  `sellerid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_commercial_TO_cbasket2p_1` (`cid`),
  KEY `FK_pbooktrade_TO_cbasket2p_1` (`bid`),
  KEY `FK_pbooktrade_TO_cbasket2p_2` (`sellerid`),
  CONSTRAINT `FK_commercial_TO_cbasket2p_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_pbooktrade_TO_cbasket2p_1` FOREIGN KEY (`bid`) REFERENCES `pbooktrade` (`bid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_pbooktrade_TO_cbasket2p_2` FOREIGN KEY (`sellerid`) REFERENCES `pbooktrade` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cbasket2s`
--

DROP TABLE IF EXISTS `cbasket2s`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cbasket2s` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `bid` bigint NOT NULL,
  `shopid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_commercial_TO_cbasket2s_1` (`cid`),
  KEY `FK_sbooktrade_TO_cbasket2s_1` (`bid`),
  KEY `FK_sbooktrade_TO_cbasket2s_2` (`shopid`),
  CONSTRAINT `FK_commercial_TO_cbasket2s_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbooktrade_TO_cbasket2s_1` FOREIGN KEY (`bid`) REFERENCES `sbooktrade` (`bid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbooktrade_TO_cbasket2s_2` FOREIGN KEY (`shopid`) REFERENCES `sbooktrade` (`sid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cbooktrade`
--

DROP TABLE IF EXISTS `cbooktrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cbooktrade` (
  `bid` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `publish` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `isbn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` int NOT NULL,
  `detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` int NOT NULL DEFAULT '1',
  `consumerid` bigint DEFAULT NULL,
  `consumer_type` int DEFAULT NULL,
  `cpid` bigint DEFAULT NULL,
  PRIMARY KEY (`bid`),
  KEY `FK_commercial_TO_cbooktrade_1` (`cid`),
  KEY `FK_cbooktrade_To_cpayment_1` (`cpid`),
  CONSTRAINT `FK_cbooktrade_To_cpayment_1` FOREIGN KEY (`cpid`) REFERENCES `cpayment` (`cpid`),
  CONSTRAINT `FK_commercial_TO_cbooktrade_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chatmessage`
--

DROP TABLE IF EXISTS `chatmessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatmessage` (
  `cmid` bigint NOT NULL AUTO_INCREMENT,
  `chid` bigint NOT NULL,
  `senderType` int NOT NULL,
  `senderid` bigint NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cmid`),
  KEY `FK_chatroom_TO_chatmessage_1` (`chid`),
  CONSTRAINT `FK_chatroom_TO_chatmessage_1` FOREIGN KEY (`chid`) REFERENCES `chatroom` (`chid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chatroom`
--

DROP TABLE IF EXISTS `chatroom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatroom` (
  `chid` bigint NOT NULL AUTO_INCREMENT,
  `user1type` int DEFAULT NULL,
  `user1id` bigint DEFAULT NULL,
  `user2type` int DEFAULT NULL,
  `user2id` bigint DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commercial`
--

DROP TABLE IF EXISTS `commercial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commercial` (
  `cid` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `presidentName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessmanName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `licence` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bankname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `bankaccount` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `accountPhoto` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commercialcert`
--

DROP TABLE IF EXISTS `commercialcert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commercialcert` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `presidentName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessmanName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `coNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `licence` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '심사중',
  `state` int NOT NULL DEFAULT '1',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bankname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `bankaccount` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `accountPhoto` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_commercial_TO_commercialcert_1` (`cid`),
  CONSTRAINT `FK_commercial_TO_commercialcert_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cpayment`
--

DROP TABLE IF EXISTS `cpayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cpayment` (
  `cpid` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `price` int NOT NULL,
  `state` int NOT NULL DEFAULT '10',
  `completePhoto` varchar(255) DEFAULT NULL,
  `reason` varchar(255) NOT NULL DEFAULT '정산진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`cpid`),
  KEY `FK_cpayment_To_commercial_1` (`cid`),
  CONSTRAINT `FK_cpayment_To_commercial_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creceipt2p`
--

DROP TABLE IF EXISTS `creceipt2p`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creceipt2p` (
  `rid` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `state` int NOT NULL DEFAULT '9',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '결제진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` int NOT NULL,
  `paidAt` timestamp NULL DEFAULT NULL,
  `installment_months` int DEFAULT NULL,
  PRIMARY KEY (`rid`),
  UNIQUE KEY `orderid` (`orderid`),
  KEY `FK_commercial_TO_creceipt2p_1` (`cid`),
  CONSTRAINT `FK_commercial_TO_creceipt2p_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creceipt2s`
--

DROP TABLE IF EXISTS `creceipt2s`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creceipt2s` (
  `rid` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `state` int NOT NULL DEFAULT '9',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '결제진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` int NOT NULL,
  `paidAt` timestamp NULL DEFAULT NULL,
  `installment_months` int DEFAULT NULL,
  PRIMARY KEY (`rid`),
  UNIQUE KEY `orderid` (`orderid`),
  KEY `FK_commercial_TO_creceipt2s_1` (`cid`),
  CONSTRAINT `FK_commercial_TO_creceipt2s_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorite4c`
--

DROP TABLE IF EXISTS `favorite4c`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite4c` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `sid` bigint NOT NULL,
  `cid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_shop_TO_favorite4c_1` (`sid`),
  KEY `FK_commercial_TO_favorite4c_1` (`cid`),
  CONSTRAINT `FK_commercial_TO_favorite4c_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_shop_TO_favorite4c_1` FOREIGN KEY (`sid`) REFERENCES `shop` (`sid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorite4p`
--

DROP TABLE IF EXISTS `favorite4p`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite4p` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `sid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_personal_TO_favorite4p_1` (`pid`),
  KEY `FK_shop_TO_favorite4p_1` (`sid`),
  CONSTRAINT `FK_personal_TO_favorite4p_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_shop_TO_favorite4p_1` FOREIGN KEY (`sid`) REFERENCES `shop` (`sid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modiaddress`
--

DROP TABLE IF EXISTS `modiaddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modiaddress` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `presidentName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessmanName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `coNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `licence` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '심사중',
  `state` int NOT NULL DEFAULT '1',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idx`),
  KEY `FK_commercial_TO_modiaddress_1` (`cid`),
  CONSTRAINT `FK_commercial_TO_modiaddress_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbasket2c`
--

DROP TABLE IF EXISTS `pbasket2c`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pbasket2c` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `bid` bigint NOT NULL,
  `sellerid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_personal_TO_pbasket2c_1` (`pid`),
  KEY `FK_cbooktrade_TO_pbasket2c_1` (`bid`),
  KEY `FK_cbooktrade_TO_pbasket2c_2` (`sellerid`),
  CONSTRAINT `FK_cbooktrade_TO_pbasket2c_1` FOREIGN KEY (`bid`) REFERENCES `cbooktrade` (`bid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_cbooktrade_TO_pbasket2c_2` FOREIGN KEY (`sellerid`) REFERENCES `cbooktrade` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_personal_TO_pbasket2c_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbasket2p`
--

DROP TABLE IF EXISTS `pbasket2p`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pbasket2p` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `bid` bigint NOT NULL,
  `sellerid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_personal_TO_pbasket2p_1` (`pid`),
  KEY `FK_pbooktrade_TO_pbasket2p_1` (`bid`),
  KEY `FK_pbooktrade_TO_pbasket2p_2` (`sellerid`),
  CONSTRAINT `FK_pbooktrade_TO_pbasket2p_1` FOREIGN KEY (`bid`) REFERENCES `pbooktrade` (`bid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_pbooktrade_TO_pbasket2p_2` FOREIGN KEY (`sellerid`) REFERENCES `pbooktrade` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_personal_TO_pbasket2p_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbasket2s`
--

DROP TABLE IF EXISTS `pbasket2s`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pbasket2s` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `bid` bigint NOT NULL,
  `shopid` bigint NOT NULL,
  PRIMARY KEY (`idx`),
  KEY `FK_personal_TO_pbasket2s_1` (`pid`),
  KEY `FK_sbooktrade_TO_pbasket2s_1` (`bid`),
  KEY `FK_sbooktrade_TO_pbasket2s_2` (`shopid`),
  CONSTRAINT `FK_personal_TO_pbasket2s_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbooktrade_TO_pbasket2s_1` FOREIGN KEY (`bid`) REFERENCES `sbooktrade` (`bid`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbooktrade_TO_pbasket2s_2` FOREIGN KEY (`shopid`) REFERENCES `sbooktrade` (`sid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbooktrade`
--

DROP TABLE IF EXISTS `pbooktrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pbooktrade` (
  `bid` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `publish` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `isbn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` int NOT NULL,
  `detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` int NOT NULL DEFAULT '1',
  `consumerid` bigint DEFAULT NULL,
  `consumer_type` int DEFAULT NULL,
  `ppid` bigint DEFAULT NULL,
  PRIMARY KEY (`bid`),
  KEY `FK_personal_TO_pbooktrade_1` (`pid`),
  KEY `FK_pbooktrade_To_ppayment_1` (`ppid`),
  CONSTRAINT `FK_pbooktrade_To_ppayment_1` FOREIGN KEY (`ppid`) REFERENCES `ppayment` (`ppid`),
  CONSTRAINT `FK_personal_TO_pbooktrade_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal`
--

DROP TABLE IF EXISTS `personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal` (
  `pid` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tel` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bankname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `bankaccount` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ppayment`
--

DROP TABLE IF EXISTS `ppayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ppayment` (
  `ppid` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `price` int NOT NULL,
  `state` int NOT NULL DEFAULT '10',
  `completePhoto` varchar(255) DEFAULT NULL,
  `reason` varchar(255) NOT NULL DEFAULT '정산진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ppid`),
  KEY `FK_ppayment_To_personal_1` (`pid`),
  CONSTRAINT `FK_ppayment_To_personal_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `preceipt2p`
--

DROP TABLE IF EXISTS `preceipt2p`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preceipt2p` (
  `rid` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `state` int NOT NULL DEFAULT '9',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '결제진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` int NOT NULL,
  `paidAt` timestamp NULL DEFAULT NULL,
  `installment_months` int DEFAULT NULL,
  PRIMARY KEY (`rid`),
  UNIQUE KEY `orderid` (`orderid`),
  KEY `FK_personal_TO_preceipt2p_1` (`pid`),
  CONSTRAINT `FK_personal_TO_preceipt2p_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `preceipt2s`
--

DROP TABLE IF EXISTS `preceipt2s`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preceipt2s` (
  `rid` bigint NOT NULL AUTO_INCREMENT,
  `pid` bigint NOT NULL,
  `state` int NOT NULL DEFAULT '9',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '결제진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` int NOT NULL,
  `paidAt` timestamp NULL DEFAULT NULL,
  `installment_months` int DEFAULT NULL,
  PRIMARY KEY (`rid`),
  UNIQUE KEY `orderid` (`orderid`),
  KEY `FK_personal_TO_preceipt2s_1` (`pid`),
  CONSTRAINT `FK_personal_TO_preceipt2s_1` FOREIGN KEY (`pid`) REFERENCES `personal` (`pid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sbooktrade`
--

DROP TABLE IF EXISTS `sbooktrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sbooktrade` (
  `bid` bigint NOT NULL AUTO_INCREMENT,
  `sid` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `publish` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `isbn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` int NOT NULL,
  `detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `img3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `orderid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` int NOT NULL DEFAULT '1',
  `consumerid` bigint DEFAULT NULL,
  `consumer_type` int DEFAULT NULL,
  `spid` bigint DEFAULT NULL,
  PRIMARY KEY (`bid`),
  KEY `FK_shop_TO_sbooktrade_1` (`sid`),
  KEY `FK_sbooktrade_To_spayment_1` (`spid`),
  CONSTRAINT `FK_sbooktrade_To_spayment_1` FOREIGN KEY (`spid`) REFERENCES `spayment` (`spid`),
  CONSTRAINT `FK_shop_TO_sbooktrade_1` FOREIGN KEY (`sid`) REFERENCES `shop` (`sid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shop`
--

DROP TABLE IF EXISTS `shop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop` (
  `sid` bigint NOT NULL AUTO_INCREMENT,
  `cid` bigint NOT NULL,
  `presidentName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessmanName` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `shopName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `shoptel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `open` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `close` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `holiday` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `shopimg1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `shopimg2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `shopimg3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `etc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sid`),
  KEY `FK_commercial_TO_shop_1` (`cid`),
  CONSTRAINT `FK_commercial_TO_shop_1` FOREIGN KEY (`cid`) REFERENCES `commercial` (`cid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spayment`
--

DROP TABLE IF EXISTS `spayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spayment` (
  `spid` bigint NOT NULL AUTO_INCREMENT,
  `sid` bigint NOT NULL,
  `price` int NOT NULL,
  `state` int NOT NULL DEFAULT '10',
  `completePhoto` varchar(255) DEFAULT NULL,
  `reason` varchar(255) NOT NULL DEFAULT '정산진행중',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`spid`),
  KEY `FK_spayment_To_shop_1` (`sid`),
  CONSTRAINT `FK_spayment_To_shop_1` FOREIGN KEY (`sid`) REFERENCES `shop` (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4cfpw`
--

DROP TABLE IF EXISTS `vaild4cfpw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4cfpw` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4cjoin`
--

DROP TABLE IF EXISTS `vaild4cjoin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4cjoin` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4cmd`
--

DROP TABLE IF EXISTS `vaild4cmd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4cmd` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `randomCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4cur`
--

DROP TABLE IF EXISTS `vaild4cur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4cur` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4pfpw`
--

DROP TABLE IF EXISTS `vaild4pfpw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4pfpw` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4pjoin`
--

DROP TABLE IF EXISTS `vaild4pjoin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4pjoin` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4pmd`
--

DROP TABLE IF EXISTS `vaild4pmd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4pmd` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `randomCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaild4pur`
--

DROP TABLE IF EXISTS `vaild4pur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaild4pur` (
  `idx` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `authCode` int NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-10 16:53:39
