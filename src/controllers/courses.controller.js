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

            course.cantidadSecciones = course.secciones.length;

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

const getStudentCourses = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener el estudiante relacionado con el usuario
        const estudiante = await prisma.estudiante.findUnique({
            where: { usuarioId: userId },
            include: { secciones: true }
        });

        if (!estudiante) {
            return responds.error(req, res, { message: 'Estudiante no encontrado.' }, 404);
        }

        // Obtener todos los cursos activos (sin deletedAt)
        const courses = await prisma.cursos.findMany({
            where: { deletedAt: null },
            include: {
                secciones: {
                    include: {
                        inscripciones: {
                            where: {
                                AND: [
                                    { estudianteId: estudiante.id },
                                    { deletedAt: null }
                                ]
                            },
                            orderBy: { createdAt: 'desc' }, // Ordenar por la inscripción más reciente
                            select: { estado: true, createdAt: true } // Obtener estado y fecha
                        }
                    }
                }
            }
        });

        const coursesWithEnrollment = courses.map(course => {
            let estadoInscripcion = 'No Inscrito';
        
            for (const seccion of course.secciones) {
                const inscripcion = seccion.inscripciones[0]; // Obtener la inscripción más reciente si existe
                if (inscripcion) {
                    if (inscripcion.estado !== 'No Aprobada') {
                        estadoInscripcion = inscripcion.estado; // Asigna el estado más relevante encontrado
                        break; // Si ya encontramos una inscripción válida, no es necesario seguir revisando
                    }
                }
            }
        
            return {
                ...course,
                inscrito: estadoInscripcion
            };
        });

        return responds.success(req, res, { message: 'Cursos obtenidos exitosamente.', data: coursesWithEnrollment }, 200);
    } catch (error) {
        console.error(error);
        return responds.error(req, res, { message: 'Error al obtener los cursos.' }, 500);
    }
};

const getStudentCoursesEnrolled = async (req, res) => {
    try {
        
        const userId = req.user.id

        const estudiante = await prisma.estudiante.findFirst({
            where: {
                usuarioId: userId
            }
        })

        if (!estudiante) {
            return responds.error(req, res, { message: 'Ha sucedido un error. Intente de nuevo'}, 404);
        }

        const courses = await prisma.cursos.findMany({
            where: {
                deletedAt: null,
                secciones: {
                    some: { // Verifica que al menos una sección tenga la inscripción aprobada del estudiante
                        inscripciones: {
                            some: {
                                estudianteId: estudiante.id,
                                deletedAt: null,
                                estado: 'Aprobada'
                            }
                        }
                    }
                }
            },
            include: {
                secciones: {
                    include: {
                        inscripciones: {
                            where: {
                                estudianteId: estudiante.id,
                                deletedAt: null,
                                estado: 'Aprobada'
                            },
                            orderBy: { createdAt: 'desc' },
                            select: { estado: true, createdAt: true }
                        }
                    }
                }
            }
        });

        return responds.success(req, res, { data: courses}, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message}, 500);
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

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.details[0].message }, 422);
        }

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

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.details[0].message }, 422);
        }

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
    getStudentCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourses_Schedule,
    getStudentCoursesEnrolled
}