// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// --------------------
// Utility Modules
// --------------------
import responds from '../red/responds.js';

// Schema
import schema from '../validations/seccionValidation.js'

// Prisma
import prisma from '../../prisma/prismaClient.js'

const createSeccion = async (req, res) => {
    try {

        // Consiguiendo los datos para la creacion de la seccion
        const data = await schema.validateAsync(req.body);

        // Verificando la existencia del profesor
        const teacher = await prisma.profesor.findFirst({
            where: {
                id: data.profesorId
            }
        })

        if (!teacher) {
            return responds.error(req, res, {message: 'Profesor no encontrado.'}, 404);
        }

        // Verificando la existencia del curso
        const course = await prisma.cursos.findFirst({
            where: {
                id: data.cursoId
            }
        })

        if (!course) {
            return responds.error(req, res, {message: 'Curso no encontrado.'}, 404);
        }

        // Verificando que sea unico el codigo
        const duplicatedSeccion = await prisma.seccion.findFirst({
            where: {
                codigo: data.codigo
            }
        })

        if (duplicatedSeccion) {
            return responds.error(req, res, {message: 'Codigo duplicado.'}, 409);
        }

        // Realizando la creacion de la seccion
        const newSeccion = await prisma.seccion.create({
            data: {
                codigo: data.codigo,
                capacidad: data.capacidad,
                salon: data.salon,
                profesorId: data.profesorId,
                cursoId: data.cursoId
            }
        })

        // Si es exitosa la creacion, mandar un mensaje al usuario
        return responds.success(req, res, {message: 'Seccion anexada exitosamente.'}, 201);

    } catch (error) {
        return responds.error(req, res, {message: error.message}, 500);
    }
}

const getSecciones = async (req, res) => {
    try {

        const { cursoId } = req.params;

        const secciones = await prisma.seccion.findMany({
            where: {
                cursoId: cursoId
            }
        })

        return responds.success(req, res, {data: secciones}, 200);

    } catch (error) {
        return responds.error(req, res, {message: error.message}, 500);
    }
}

export default { 
    createSeccion,
    getSecciones
}