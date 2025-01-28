/*
  Warnings:

  - Added the required column `updatedAt` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscripcion` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `estado` VARCHAR(191) NOT NULL DEFAULT 'En Espera',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
