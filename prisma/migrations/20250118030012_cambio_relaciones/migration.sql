/*
  Warnings:

  - You are about to drop the `_estudiantetousuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId]` on the table `Estudiante` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId]` on the table `Profesor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `_estudiantetousuario` DROP FOREIGN KEY `_EstudianteToUsuario_A_fkey`;

-- DropForeignKey
ALTER TABLE `_estudiantetousuario` DROP FOREIGN KEY `_EstudianteToUsuario_B_fkey`;

-- DropTable
DROP TABLE `_estudiantetousuario`;

-- CreateIndex
CREATE UNIQUE INDEX `Administrador_usuarioId_key` ON `Administrador`(`usuarioId`);

-- CreateIndex
CREATE UNIQUE INDEX `Estudiante_usuarioId_key` ON `Estudiante`(`usuarioId`);

-- CreateIndex
CREATE UNIQUE INDEX `Profesor_usuarioId_key` ON `Profesor`(`usuarioId`);

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
