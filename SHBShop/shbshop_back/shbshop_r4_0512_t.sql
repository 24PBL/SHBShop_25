CREATE TABLE `commercial` (
	`cid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`presidentName`	varchar(13)	NOT NULL,
	`businessmanName`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`businessEmail`	varchar(255)	NOT NULL,
	`password`	varchar(255)	NOT NULL,
	`nickname`	varchar(64)	NOT NULL,
	`address`	varchar(255)	NOT NULL,
	`region`	varchar(64)	NOT NULL,
	`img`	varchar(255)	NULL,
	`coNumber`	varchar(255)	NOT NULL,
	`licence`	varchar(255)	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `shop` (
	`sid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`presidentName`	varchar(13)	NOT NULL,
	`businessmanName`	varchar(13)	NOT NULL,
	`shopName`	varchar(255)	NOT NULL,
	`shoptel`	varchar(255)	NOT NULL,
	`businessEmail`	varchar(255)	NOT NULL,
	`address`	varchar(255)	NOT NULL,
	`region`	varchar(64)	NOT NULL,
	`open`	varchar(16)	NOT NULL,
	`close`	varchar(16)	NOT NULL,
	`holiday`	varchar(255)	NOT NULL,
	`shopimg1`	varchar(255)	NOT NULL,
	`shopimg2`	varchar(255)	NOT NULL,
	`shopimg3`	varchar(255)	NOT NULL,
	`etc`	varchar(255)	NOT NULL,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `auth4pjoin` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `auth4pfpw` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vaild4cfpw` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `personal` (
	`pid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`password`	varchar(255)	NOT NULL,
	`nickname`	varchar(64)	NOT NULL,
	`address`	varchar(255)	NOT NULL,
	`region`	varchar(64)	NOT NULL,
	`img`	varchar(255)	NULL,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `commercialcert` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`name`	varchar(13)	NOT NULL,
	`presidentName`	varchar(13)	NOT NULL,
	`businessmanName`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`businessEmail`	varchar(255)	NOT NULL,
	`address`	varchar(255)	NOT NULL,
	`coNumber`	varchar(255)	NOT NULL,
	`licence`	varchar(255)	NOT NULL,
	`reason`	varchar(255)	NOT NULL	DEFAULT '심사중',
	`state`	int	NOT NULL	DEFAULT 1,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `favorite4p` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`sid`	bigint	NOT NULL
);

CREATE TABLE `favorite4c` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`sid`	bigint	NOT NULL,
	`cid`	bigint	NOT NULL
);

CREATE TABLE `vaild4cjoin` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `vaild4pfpw` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `auth4cjoin` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `adminacc` (
	`aid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`acc`	varchar(255)	NOT NULL,
	`password`	varchar(255)	NOT NULL
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vaild4pjoin` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `auth4cfpw` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `auth4pur` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `auth4cur` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name`	varchar(13)	NOT NULL,
	`birth`	varchar(10)	NOT NULL,
	`tel`	varchar(13)	NOT NULL,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vaild4pur` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `vaild4cur` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`authCode`	int	NOT NULL
);

CREATE TABLE `pbooktrade` (
	`bid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`title`	varchar(255)	NOT NULL,
	`author`	varchar(255)	NOT NULL,
	`publish`	varchar(255)	NOT NULL,
	`isbn`	varchar(255)	NOT NULL,
	`price`	int	NOT NULL,
	`detail`	varchar(255)	NOT NULL,
	`region`	varchar(64)	NOT NULL,
	`img1`	varchar(255)	NOT NULL,
	`img2`	varchar(255)	NOT NULL,
	`img3`	varchar(255)	NOT NULL,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sbooktrade` (
	`bid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`sid`	bigint	NOT NULL,
	`title`	varchar(255)	NOT NULL,
	`author`	varchar(255)	NOT NULL,
	`publish`	varchar(255)	NOT NULL,
	`isbn`	varchar(255)	NOT NULL,
	`price`	int	NOT NULL,
	`detail`	varchar(255)	NOT NULL,
	`region`	varchar(64)	NOT NULL,
	`img1`	varchar(255)	NOT NULL,
	`img2`	varchar(255)	NOT NULL,
	`img3`	varchar(255)	NOT NULL,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cbooktrade` (
	`bid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`title`	varchar(255)	NOT NULL,
	`author`	varchar(255)	NOT NULL,
	`publish`	varchar(255)	NOT NULL,
	`isbn`	varchar(255)	NOT NULL,
	`price`	int	NOT NULL,
	`detail`	varchar(255)	NOT NULL,
	`region`	varchar(64)	NOT NULL,
	`img1`	varchar(255)	NOT NULL,
	`img2`	varchar(255)	NOT NULL,
	`img3`	varchar(255)	NOT NULL,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `modiaddress` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`name`	varchar(13)	NOT NULL,
	`presidentName`	varchar(13)	NOT NULL,
	`businessmanName`	varchar(13)	NOT NULL,
	`businessEmail`	varchar(255)	NOT NULL,
	`coNumber`	varchar(255)	NOT NULL,
	`address`	varchar(255)	NOT NULL,
	`licence`	varchar(255)	NOT NULL,
	`reason`	varchar(255)	NOT NULL	DEFAULT '심사중',
	`state`	int	NOT NULL	DEFAULT 1,
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vaild4pmd` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`randomCode`	int	NOT NULL
);

CREATE TABLE `vaild4cmd` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email`	varchar(255)	NOT NULL,
	`randomCode`	int	NOT NULL
);

CREATE TABLE `pbasket2p` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL
);

CREATE TABLE `pbasket2c` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL
);

CREATE TABLE `pbasket2s` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`shopid`	bigint	NOT NULL
);

CREATE TABLE `cbasket2p` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL
);

CREATE TABLE `cbasket2c` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL
);

CREATE TABLE `cbasket2s` (
	`idx`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`shopid`	bigint	NOT NULL
);

CREATE TABLE `preceipt2p` (
	`rid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`reason`	varchar(255)	NOT NULL	DEFAULT '결제완료',
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `preceipt2c` (
	`rid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`reason`	varchar(255)	NOT NULL	DEFAULT '결제완료',
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `preceipt2s` (
	`rid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`pid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`shopid`	bigint	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`reason`	varchar(255)	NOT NULL	DEFAULT '결제완료',
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `creceipt2p` (
	`rid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`reason`	varchar(255)	NOT NULL	DEFAULT '결제완료',
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `creceipt2c` (
	`rid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`sellerid`	bigint	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`reason`	varchar(255)	NOT NULL	DEFAULT '결제완료',
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `creceipt2s` (
	`rid`	bigint	NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`cid`	bigint	NOT NULL,
	`bid`	bigint	NOT NULL,
	`shopid`	bigint	NOT NULL,
	`state`	int	NOT NULL	DEFAULT 1,
	`reason`	varchar(255)	NOT NULL	DEFAULT '결제완료',
	`createAt`	timestamp	NOT NULL	DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `commercialcert` ADD CONSTRAINT `FK_commercial_TO_commercialcert_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `shop` ADD CONSTRAINT `FK_commercial_TO_shop_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `favorite4p` ADD CONSTRAINT `FK_personal_TO_favorite4p_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `favorite4p` ADD CONSTRAINT `FK_shop_TO_favorite4p_1` FOREIGN KEY (
	`sid`
)
REFERENCES `shop` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `favorite4c` ADD CONSTRAINT `FK_shop_TO_favorite4c_1` FOREIGN KEY (
	`sid`
)
REFERENCES `shop` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `favorite4c` ADD CONSTRAINT `FK_commercial_TO_favorite4c_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbooktrade` ADD CONSTRAINT `FK_personal_TO_pbooktrade_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `sbooktrade` ADD CONSTRAINT `FK_shop_TO_sbooktrade_1` FOREIGN KEY (
	`sid`
)
REFERENCES `shop` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbooktrade` ADD CONSTRAINT `FK_commercial_TO_cbooktrade_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `modiaddress` ADD CONSTRAINT `FK_commercial_TO_modiaddress_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2p` ADD CONSTRAINT `FK_personal_TO_pbasket2p_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2p` ADD CONSTRAINT `FK_pbooktrade_TO_pbasket2p_1` FOREIGN KEY (
	`bid`
)
REFERENCES `pbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2p` ADD CONSTRAINT `FK_pbooktrade_TO_pbasket2p_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `pbooktrade` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2c` ADD CONSTRAINT `FK_personal_TO_pbasket2c_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2c` ADD CONSTRAINT `FK_cbooktrade_TO_pbasket2c_1` FOREIGN KEY (
	`bid`
)
REFERENCES `cbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2c` ADD CONSTRAINT `FK_cbooktrade_TO_pbasket2c_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `cbooktrade` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2s` ADD CONSTRAINT `FK_personal_TO_pbasket2s_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2s` ADD CONSTRAINT `FK_sbooktrade_TO_pbasket2s_1` FOREIGN KEY (
	`bid`
)
REFERENCES `sbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `pbasket2s` ADD CONSTRAINT `FK_sbooktrade_TO_pbasket2s_2` FOREIGN KEY (
	`shopid`
)
REFERENCES `sbooktrade` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2p` ADD CONSTRAINT `FK_commercial_TO_cbasket2p_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2p` ADD CONSTRAINT `FK_pbooktrade_TO_cbasket2p_1` FOREIGN KEY (
	`bid`
)
REFERENCES `pbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2p` ADD CONSTRAINT `FK_pbooktrade_TO_cbasket2p_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `pbooktrade` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2c` ADD CONSTRAINT `FK_commercial_TO_cbasket2c_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2c` ADD CONSTRAINT `FK_cbooktrade_TO_cbasket2c_1` FOREIGN KEY (
	`bid`
)
REFERENCES `cbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2c` ADD CONSTRAINT `FK_cbooktrade_TO_cbasket2c_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `cbooktrade` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2s` ADD CONSTRAINT `FK_commercial_TO_cbasket2s_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2s` ADD CONSTRAINT `FK_sbooktrade_TO_cbasket2s_1` FOREIGN KEY (
	`bid`
)
REFERENCES `sbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `cbasket2s` ADD CONSTRAINT `FK_sbooktrade_TO_cbasket2s_2` FOREIGN KEY (
	`shopid`
)
REFERENCES `sbooktrade` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2p` ADD CONSTRAINT `FK_personal_TO_preceipt2p_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2p` ADD CONSTRAINT `FK_pbooktrade_TO_preceipt2p_1` FOREIGN KEY (
	`bid`
)
REFERENCES `pbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2p` ADD CONSTRAINT `FK_pbooktrade_TO_preceipt2p_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `pbooktrade` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2c` ADD CONSTRAINT `FK_personal_TO_preceipt2c_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2c` ADD CONSTRAINT `FK_cbooktrade_TO_preceipt2c_1` FOREIGN KEY (
	`bid`
)
REFERENCES `cbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2c` ADD CONSTRAINT `FK_cbooktrade_TO_preceipt2c_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `cbooktrade` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2s` ADD CONSTRAINT `FK_personal_TO_preceipt2s_1` FOREIGN KEY (
	`pid`
)
REFERENCES `personal` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2s` ADD CONSTRAINT `FK_sbooktrade_TO_preceipt2s_1` FOREIGN KEY (
	`bid`
)
REFERENCES `sbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `preceipt2s` ADD CONSTRAINT `FK_sbooktrade_TO_preceipt2s_2` FOREIGN KEY (
	`shopid`
)
REFERENCES `sbooktrade` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2p` ADD CONSTRAINT `FK_commercial_TO_creceipt2p_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2p` ADD CONSTRAINT `FK_pbooktrade_TO_creceipt2p_1` FOREIGN KEY (
	`bid`
)
REFERENCES `pbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2p` ADD CONSTRAINT `FK_pbooktrade_TO_creceipt2p_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `pbooktrade` (
	`pid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2c` ADD CONSTRAINT `FK_commercial_TO_creceipt2c_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2c` ADD CONSTRAINT `FK_cbooktrade_TO_creceipt2c_1` FOREIGN KEY (
	`bid`
)
REFERENCES `cbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2c` ADD CONSTRAINT `FK_cbooktrade_TO_creceipt2c_2` FOREIGN KEY (
	`sellerid`
)
REFERENCES `cbooktrade` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2s` ADD CONSTRAINT `FK_commercial_TO_creceipt2s_1` FOREIGN KEY (
	`cid`
)
REFERENCES `commercial` (
	`cid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2s` ADD CONSTRAINT `FK_sbooktrade_TO_creceipt2s_1` FOREIGN KEY (
	`bid`
)
REFERENCES `sbooktrade` (
	`bid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE `creceipt2s` ADD CONSTRAINT `FK_sbooktrade_TO_creceipt2s_2` FOREIGN KEY (
	`shopid`
)
REFERENCES `sbooktrade` (
	`sid`
)
ON DELETE CASCADE
ON UPDATE RESTRICT;