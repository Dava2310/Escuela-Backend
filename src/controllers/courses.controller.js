// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// --------------------
// Utility Modules
// --------------------
import responds from '../red/responds.js';

// Schema
import schema from '../validations/courseValidation.js'

// Prisma
import prisma from '../../prisma/prismaClient.js'

const getCourses = async (req, res) => {
    try {

        const courses = await prisma.cursos.findMany({
            where: {
                deletedAt: null
            },
            include: {
                // Incluimos las secciones
                secciones: {
                    include: {
                        estudiantes: true // Relación con estudiantes dentro de la sección
                    }
                },
            }
        });

        for (let course of courses) {
            course.estado = 'activo';

            // Contar la cantidad total de estudiantes en todas las secciones del curso
            let totalEstudiantes = 0;
            for (let seccion of course.secciones) {
                totalEstudiantes += seccion.estudiantes.length; // Contamos los estudiantes por sección
            }

            // Asignar la matrícula total al curso
            course.matricula = totalEstudiantes;
            course.estado = 'activo'
        }

        return responds.success(req, res, { data: courses }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};
const getCourses_Schedule = async (req, res) => {
    try {
        const courses = await prisma.cursos.findMany({
            where: {
                deletedAt: null
            },
            include: {
                secciones: {
                    include: {
                        estudiantes: true,
                        horario: { 
                            include: {
                                dias: true
                            }
                        }
                    }
                },
            }
        });

        for (let course of courses) {
            course.estado = 'activo';

            // Contar la cantidad total de estudiantes en todas las secciones del curso
            let totalEstudiantes = 0;
            for (let seccion of course.secciones) {
                totalEstudiantes += seccion.estudiantes.length; // Contamos los estudiantes por sección
            }

            // Asignar la matrícula total al curso
            course.matricula = totalEstudiantes;

            // Transformar el formato de los horarios en cada sección
            for (let seccion of course.secciones) {
                if (seccion.horario) {
                    // Transformar el array de días a minúsculas y sin acentos
                    const diasRepeticion = seccion.horario.dias.map(dia => removeAccents(dia.dia));
                    
                    // Crear un nuevo objeto horario con el formato esperado
                    seccion.horario = {
                        id: seccion.horario.id,
                        fechaInicio: seccion.horario.fechaInicio,
                        fechaFin: seccion.horario.fechaFinal,
                        horaInicio: seccion.horario.horaInicio,
                        horaFinal: seccion.horario.horaFinal,
                        diasRepeticion, // Los días transformados
                        tipo: seccion.horario.tipo
                    };
                }
            }
        }

        return responds.success(req, res, { data: courses }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
};

const getOneCourse = async (req, res) => {
    try {

        const { courseId } = req.params;

        const course = await prisma.cursos.findFirst({
            where: {
                AND: [
                    { id: courseId },
                    { deletedAt: null }
                ]
            }
        });

        if (!course) {
            return responds.error(req, res, { message: 'Curso no encontrado.' }, 404);
        }

        return responds.success(req, res, { message: 'Curso encontrado.', data: course }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const createCourse = async (req, res) => {
    try {
        const data = await schema.courseRegister.validateAsync(req.body);

        // console.log(data);

        // Verificando que no se duplique el codigo del curso
        const cursoDuplicado = await prisma.cursos.findFirst({
            where: {
                codigo: data.codigo
            }
        });

        if (cursoDuplicado) {
            return responds.error(req, res, { message: 'Codigo ya utilizado.' }, 409);
        }

        // Creando el curso
        const newCourse = await prisma.cursos.create({
            data: data
        })

        return responds.success(req, res, { message: 'Curso creado exitosamente.', data: newCourse }, 201);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verificando la existencia del curso
        const course = await prisma.cursos.findFirst({
            where: {
                AND: [
                    { id: courseId },
                    { deletedAt: null }
                ]
            }
        });

        if (!course) {
            return responds.error(req, res, { message: 'Curso no encontrado.' }, 404);
        }

        // Obteniendo los datos y validándolos
        const data = await schema.courseEdit.validateAsync(req.body);

        // Verificando que no se duplique el codigo del curso contra otros cursos diferentes
        const cursoDuplicado = await prisma.cursos.findFirst({
            where: {
                AND: [
                    { codigo: data.codigo },
                    {
                        NOT: {
                            id: courseId
                        }
                    }
                ]
            }
        });

        if (cursoDuplicado) {
            return responds.error(req, res, { message: 'Codigo ya utilizado.' }, 409);
        }

        // Realizando la modificacion
        const updatedCourse = await prisma.cursos.update({
            where: {
                id: course.id
            },
            data: data
        });

        return responds.success(req, res, { data: updatedCourse, message: "Curso modificado exitosamente." }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verificando la existencia del curso
        const course = await prisma.cursos.findUnique({
            where: {
                id: courseId
            }
        });

        if (!course) {
            return responds.error(req, res, { message: 'Curso no encontrado.' }, 404);
        }

        // Actualizar el curso con una eliminacion logica
        await prisma.cursos.update({
            where: {
                id: course.id
            },
            data: {
                deletedAt: new Date()
            }
        })

        return responds.success(req, res, { message: 'Curso eliminado exitosamente.' }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

export default {
    getCourses,
    getOneCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourses_Schedule
}