-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `empresa` DROP FOREIGN KEY `Empresa_donoId_fkey`;

-- DropForeignKey
ALTER TABLE `mensagem` DROP FOREIGN KEY `Mensagem_destinatarioId_fkey`;

-- DropForeignKey
ALTER TABLE `mensagem` DROP FOREIGN KEY `Mensagem_remetenteId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- AlterTable
ALTER TABLE `empresa` ADD COLUMN `isDemo` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `plano` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    ADD COLUMN `status` ENUM('ATIVA', 'SUSPENSA', 'EXCLUIDA') NOT NULL DEFAULT 'ATIVA',
    MODIFY `cnpj` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `LogAdministrativo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `empresaId` INTEGER NULL,
    `detalhes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LogAdministrativo_adminId_createdAt_idx`(`adminId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresa` ADD CONSTRAINT `empresa_donoId_fkey` FOREIGN KEY (`donoId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensagem` ADD CONSTRAINT `mensagem_remetenteId_fkey` FOREIGN KEY (`remetenteId`) REFERENCES `empresa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensagem` ADD CONSTRAINT `mensagem_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `empresa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogAdministrativo` ADD CONSTRAINT `LogAdministrativo_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `account_provider_providerAccountId_key` ON `account`(`provider`, `providerAccountId`);
DROP INDEX `Account_provider_providerAccountId_key` ON `account`;

-- RedefineIndex
CREATE UNIQUE INDEX `empresa_cnpj_key` ON `empresa`(`cnpj`);
DROP INDEX `Empresa_cnpj_key` ON `empresa`;

-- RedefineIndex
CREATE UNIQUE INDEX `session_sessionToken_key` ON `session`(`sessionToken`);
DROP INDEX `Session_sessionToken_key` ON `session`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
DROP INDEX `User_email_key` ON `user`;
