
CREATE TABLE IF NOT EXISTS `fy_atividade` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empresaOrigemId` INT NOT NULL,
  `tipo` ENUM('BUSCA', 'CONTATO') NOT NULL,
  `empresaDestinoId` INT NULL,
  `termo` VARCHAR(191) NULL,
  `chave` VARCHAR(191) NOT NULL,
  `dia` DATE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `fy_atividade_unica_dia` (
    `empresaOrigemId`,
    `dia`,
    `chave`
  ),

  KEY `fy_atividade_origem_tipo_dia` (
    `empresaOrigemId`,
    `tipo`,
    `dia`
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fy_favorito` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empresaOrigemId` INT NOT NULL,
  `empresaDestinoId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `fy_favorito_unico` (
    `empresaOrigemId`,
    `empresaDestinoId`
  ),

  KEY `fy_favorito_origem` (`empresaOrigemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
