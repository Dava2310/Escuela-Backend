/*
  Warnings:

  - You are about to drop the column `horaFinal` on the `horario` table. All the data in the column will be lost.
  - You are about to drop the column `horaInicio` on the `horario` table. All the data in the column will be lost.
  - You are about to drop the column `salon` on the `horario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[horarioId]` on the table `Cursos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Cursos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacidad` to the `Horario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cursos` DROP FOREIGN KEY `Cursos_horarioId_fkey`;

-- AlterTable
ALTER TABLE `cursos` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `horarioId` INTEGER NULL;

-- AlterTable
ALTER TABLE `horario` DROP COLUMN `horaFinal`,
    DROP COLUMN `horaInicio`,
    DROP COLUMN `salon`,
    ADD COLUMN `capacidad` INTEGER NOT NULL,
    ADD COLUMN `estado` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `tipo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `DiaHorario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dia` VARCHAR(191) NOT NULL,
    `horaInicio` VARCHAR(191) NOT NULL,
    `horaFinal` VARCHAR(191) NOT NULL,
    `salon` VARCHAR(191) NOT NULL,
    `horarioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Cursos_horarioId_key` ON `Cursos`(`horarioId`);

-- AddForeignKey
ALTER TABLE `Cursos` ADD CONSTRAINT `Cursos_horarioId_fkey` FOREIGN KEY (`horarioId`) REFERENCES `Horario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiaHorario` ADD CONSTRAINT `DiaHorario_horarioId_fkey` FOREIGN KEY (`horarioId`) REFERENCES `Horario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
