/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cnpj` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descricao` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `empresa` ADD COLUMN `cnpj` VARCHAR(191) NOT NULL,
    ADD COLUMN `descricao` TEXT NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `telefone` VARCHAR(191) NOT NULL,
    MODIFY `avaliacao` VARCHAR(191) NOT NULL DEFAULT 'Novo';

-- CreateIndex
CREATE UNIQUE INDEX `Empresa_cnpj_key` ON `Empresa`(`cnpj`);
