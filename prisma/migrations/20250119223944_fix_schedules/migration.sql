/*
  Warnings:

  - You are about to drop the column `horaFinal` on the `diahorario` table. All the data in the column will be lost.
  - You are about to drop the column `horaInicio` on the `diahorario` table. All the data in the column will be lost.
  - You are about to drop the column `salon` on the `diahorario` table. All the data in the column will be lost.
  - Added the required column `horaFinal` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaInicio` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salon` to the `Horario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `diahorario` DROP COLUMN `horaFinal`,
    DROP COLUMN `horaInicio`,
    DROP COLUMN `salon`;

-- AlterTable
ALTER TABLE `horario` ADD COLUMN `horaFinal` VARCHAR(191) NOT NULL,
    ADD COLUMN `horaInicio` VARCHAR(191) NOT NULL,
    ADD COLUMN `salon` VARCHAR(191) NOT NULL,
    MODIFY `capacidad` INTEGER NULL;
