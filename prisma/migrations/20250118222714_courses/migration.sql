/*
  Warnings:

  - You are about to drop the column `Codigo` on the `cursos` table. All the data in the column will be lost.
  - You are about to drop the column `Descripcion` on the `cursos` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre` on the `cursos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `Cursos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Cursos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descripcion` to the `Cursos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Cursos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Cursos_Codigo_key` ON `cursos`;

-- AlterTable
ALTER TABLE `cursos` DROP COLUMN `Codigo`,
    DROP COLUMN `Descripcion`,
    DROP COLUMN `Nombre`,
    ADD COLUMN `codigo` VARCHAR(191) NOT NULL,
    ADD COLUMN `descripcion` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Cursos_codigo_key` ON `Cursos`(`codigo`);
