
CREATE TABLE IF NOT EXISTS `fy_visita` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empresaOrigemId` INT NOT NULL,
  `empresaDestinoId` INT NOT NULL,
  `dia` DATE NOT NULL,

  PRIMARY KEY (`id`),

  UNIQUE KEY `fy_visita_origem_destino_dia_key` (
    `empresaOrigemId`,
    `empresaDestinoId`,
    `dia`
  ),

  KEY `fy_visita_origem_idx` (`empresaOrigemId`),
  KEY `fy_visita_destino_idx` (`empresaDestinoId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
