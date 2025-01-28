import responds from '../red/responds.js';

// --------------------
// Prisma Module
// --------------------
import prisma from '../../prisma/prismaClient.js'

const getStatistics = async (req, res) => {
    try {
        // 1. Distribución de edades de los estudiantes
        const edadDistribucion = await prisma.estudiante.findMany({
            select: {
                fechaNacimiento: true,
            }
        });

        // 2. Calcular distribución por rango de edad
        const edadDistribucionCount = {
            "0-17": 0,
            "18-22": 0,
            "23-27": 0,
            "28-32": 0,
            "33-37": 0,
            "38+": 0,
        };

        const today = new Date();
        edadDistribucion.forEach((estudiante) => {
            const edad = today.getFullYear() - estudiante.fechaNacimiento.getFullYear();
            if (edad < 17) {
                edadDistribucionCount["0-17"] += 1;
            }
            else if (edad >= 18 && edad <= 22) {
                edadDistribucionCount["18-22"] += 1;
            } else if (edad >= 23 && edad <= 27) {
                edadDistribucionCount["23-27"] += 1;
            } else if (edad >= 28 && edad <= 32) {
                edadDistribucionCount["28-32"] += 1;
            } else if (edad >= 33 && edad <= 37) {
                edadDistribucionCount["33-37"] += 1;
            } else if (edad >= 38) {
                edadDistribucionCount["38+"] += 1;
            }
        });

        // Convertir el conteo en el formato esperado
        const edadDistribucionFormatted = Object.keys(edadDistribucionCount).map((rango) => ({
            rango,
            cantidad: edadDistribucionCount[rango],
        }));

        // 3. Cursos por categoría
        const cursosPorCategoria = await prisma.cursos.groupBy({
            by: ['categoria'],
            _count: {
                id: true
            }
        });

        const cursosPorCategoriaFormatted = cursosPorCategoria.map((curso) => ({
            categoria: curso.categoria,
            cantidad: curso._count.id,
        }));

        // 4. Total de estudiantes
        const totalEstudiantes = await prisma.estudiante.count();

        // 5. Total de cursos
        const totalCursos = await prisma.cursos.count();

        // 6. Devolver los datos
        const estadisticasData = {
            edadDistribucion: edadDistribucionFormatted,
            cursosPorCategoria: cursosPorCategoriaFormatted,
            totalEstudiantes,
            totalCursos,
        };

        return responds.success(req, res, estadisticasData, 200);
    } catch (error) {
        return responds.error(req, res, { message: error.message}, 500);
    }
}

export default {
    getStatistics
}