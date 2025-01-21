/*
  Warnings:

  - You are about to drop the column `cursoId` on the `certificado` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `cursos` table. All the data in the column will be lost.
  - You are about to drop the column `horarioId` on the `cursos` table. All the data in the column will be lost.
  - You are about to drop the column `profesorId` on the `cursos` table. All the data in the column will be lost.
  - You are about to drop the column `cursoId` on the `inscripcion` table. All the data in the column will be lost.
  - You are about to drop the `estudiante_cursos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `seccionId` to the `Certificado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seccionId` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `certificado` DROP FOREIGN KEY `Certificado_cursoId_fkey`;

-- DropForeignKey
ALTER TABLE `cursos` DROP FOREIGN KEY `Cursos_horarioId_fkey`;

-- DropForeignKey
ALTER TABLE `cursos` DROP FOREIGN KEY `Cursos_profesorId_fkey`;

-- DropForeignKey
ALTER TABLE `diahorario` DROP FOREIGN KEY `DiaHorario_horarioId_fkey`;

-- DropForeignKey
ALTER TABLE `estudiante_cursos` DROP FOREIGN KEY `Estudiante_Cursos_idCurso_fkey`;

-- DropForeignKey
ALTER TABLE `estudiante_cursos` DROP FOREIGN KEY `Estudiante_Cursos_idEstudiante_fkey`;

-- DropForeignKey
ALTER TABLE `inscripcion` DROP FOREIGN KEY `Inscripcion_cursoId_fkey`;

-- DropIndex
DROP INDEX `Cursos_horarioId_key` ON `cursos`;

-- AlterTable
ALTER TABLE `certificado` DROP COLUMN `cursoId`,
    ADD COLUMN `seccionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `cursos` DROP COLUMN `categoria`,
    DROP COLUMN `horarioId`,
    DROP COLUMN `profesorId`;

-- AlterTable
ALTER TABLE `inscripcion` DROP COLUMN `cursoId`,
    ADD COLUMN `seccionId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `estudiante_cursos`;

-- DropTable
DROP TABLE `horario`;

-- CreateTable
CREATE TABLE `secciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `capacidad` INTEGER NOT NULL,
    `salon` VARCHAR(191) NOT NULL,
    `profesorId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `horarioId` INTEGER NULL,

    UNIQUE INDEX `secciones_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estudiante_Seccion` (
    `idEstudiante` INTEGER NOT NULL,
    `idSeccion` INTEGER NOT NULL,

    PRIMARY KEY (`idEstudiante`, `idSeccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFinal` DATETIME(3) NOT NULL,
    `horaInicio` VARCHAR(191) NOT NULL,
    `horaFinal` VARCHAR(191) NOT NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,
    `seccionId` INTEGER NOT NULL,

    UNIQUE INDEX `horarios_seccionId_key`(`seccionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `secciones` ADD CONSTRAINT `secciones_profesorId_fkey` FOREIGN KEY (`profesorId`) REFERENCES `Profesor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `secciones` ADD CONSTRAINT `secciones_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Cursos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante_Seccion` ADD CONSTRAINT `Estudiante_Seccion_idSeccion_fkey` FOREIGN KEY (`idSeccion`) REFERENCES `secciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante_Seccion` ADD CONSTRAINT `Estudiante_Seccion_idEstudiante_fkey` FOREIGN KEY (`idEstudiante`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios` ADD CONSTRAINT `horarios_seccionId_fkey` FOREIGN KEY (`seccionId`) REFERENCES `secciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiaHorario` ADD CONSTRAINT `DiaHorario_horarioId_fkey` FOREIGN KEY (`horarioId`) REFERENCES `horarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificado` ADD CONSTRAINT `Certificado_seccionId_fkey` FOREIGN KEY (`seccionId`) REFERENCES `secciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_seccionId_fkey` FOREIGN KEY (`seccionId`) REFERENCES `secciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
