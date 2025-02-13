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
        const data = await schema.seccionRegister.validateAsync(req.body);

        // Verificando la existencia del profesor
        const teacher = await prisma.profesor.findFirst({
            where: {
                id: data.profesorId
            }
        })

        if (!teacher) {
            return responds.error(req, res, { message: 'Profesor no encontrado.' }, 404);
        }

        // Verificando la existencia del curso
        const course = await prisma.cursos.findFirst({
            where: {
                id: data.cursoId
            }
        })

        if (!course) {
            return responds.error(req, res, { message: 'Curso no encontrado.' }, 404);
        }

        // Verificando que sea unico el codigo
        const duplicatedSeccion = await prisma.seccion.findFirst({
            where: {
                codigo: data.codigo
            }
        })

        if (duplicatedSeccion) {
            return responds.error(req, res, { message: 'Codigo duplicado.' }, 409);
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
        return responds.success(req, res, { message: 'Seccion anexada exitosamente.' }, 201);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const updateSeccion = async (req, res) => {
    try {
        
        const { seccionId } = req.params;

        // Consiguiendo los datos para la creacion de la seccion
        const data = await schema.seccionEdit.validateAsync(req.body);

        // Verificando la existencia de la seccion
        const seccion = await prisma.seccion.findFirst({
            where: {
                id: seccionId
            }
        })

        if (!seccion) {
            return responds.error(req, res, { message: 'Seccion no encontrada.'}, 404);
        }

        // Verificando la existencia del profesor
        const teacher = await prisma.profesor.findFirst({
            where: {
                id: data.profesorId
            }
        })

        if (!teacher) {
            return responds.error(req, res, { message: 'Profesor no encontrado.' }, 404);
        }

        // Verificando que sea unico el codigo
        const duplicatedSeccion = await prisma.seccion.findFirst({
            where: {
                AND: [
                    { codigo: data.codigo },
                    { NOT: {id: seccion.id}}
                ]
                
            }
        })

        if (duplicatedSeccion) {
            return responds.error(req, res, { message: 'Codigo duplicado.' }, 409);
        }

        // Haciendo la actualización de datos básicos
        await prisma.seccion.update({
            where: {
                id: seccion.id
            },
            data: {
                capacidad: data.capacidad,
                salon: data.salon,
                codigo: data.codigo,
                profesorId: data.profesorId
            }
        })

        // Mensaje de respuesta
        return responds.success(req, res, { message: 'Sección actualizada exitosamente.'}, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const getSecciones = async (req, res) => {
    try {
        const { cursoId } = req.params;

        const secciones = await prisma.seccion.findMany({
            where: {
                cursoId: Number(cursoId) // Asegurar que cursoId es un número
            },
            include: {
                horario: {
                    include: {
                        dias: true // Incluir los días del horario
                    }
                },
                curso: true
            }
        });

        // Transformar los resultados para incluir `diasRepeticion`
        const seccionesConDias = secciones.map(seccion => ({
            ...seccion,
            nombreCurso: seccion.curso.nombre,
            diasRepeticion: seccion.horario?.dias.map(dia => dia.dia) || [] // Extraer solo los nombres de los días
        }));

        return responds.success(req, res, { data: seccionesConDias }, 200);
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
};

const getStudents = async (req, res) => {
    try {
        const { seccionId } = req.params;

        // Obtener la sección con los estudiantes y sus datos de usuario
        const seccion = await prisma.seccion.findUnique({
            where: {
                id: parseInt(seccionId) // Aseguramos que seccionId sea un número
            },
            include: {
                estudiantes: { // Incluye la relación Estudiante_Seccion
                    include: {
                        estudiante: { // Incluye la relación con Estudiante
                            include: {
                                usuario: true // Incluye la relación con Usuario
                            }
                        }
                    }
                }
            }
        });

        if (!seccion) {
            return responds.error(req, res, { message: 'Sección no encontrada.' }, 404);
        }

        // Formatear la respuesta para que sea más directa
        const estudiantes = seccion.estudiantes.map(entry => ({
            id: entry.estudiante.id,
            nombre: entry.estudiante.usuario.nombre,
            apellido: entry.estudiante.usuario.apellido,
            email: entry.estudiante.usuario.email,
            cedula: entry.estudiante.usuario.cedula,
            direccion: entry.estudiante.direccion,
            numeroTelefono: entry.estudiante.numeroTelefono,
            fechaNacimiento: entry.estudiante.fechaNacimiento
        }));

        return responds.success(req, res, { message: 'Estudiantes obtenidos exitosamente.', data: estudiantes }, 200);
    } catch (error) {
        return responds.error(req, res, { message: 'Error al obtener los estudiantes de la sección.' }, 500);
    }
};

const getTeacherSections = async (req, res) => {
    try {
        const userId  = req.user.id;

        // Obtener al profesor basado en el usuario
        const teacher = await prisma.profesor.findFirst({
            where: {
                usuarioId: userId,
            },
        });

        if (!teacher) {
            return responds.error(req, res, { message: 'Profesor no encontrado.' }, 404);
        }

        // Obtener las secciones del profesor con la información necesaria
        const sections = await prisma.seccion.findMany({
            where: {
                profesorId: teacher.id,
            },
            include: {
                curso: true, // Información del curso relacionado
                horario: {
                    include: {
                        dias: true, // Información de los días del horario
                    },
                },
                estudiantes: {
                    include: {
                        estudiante: {
                            include: {
                                usuario: true, // Información del usuario del estudiante
                            },
                        },
                    },
                },
            },
        });

        // Transformar los datos para incluir el estado "aprobado" o "reprobado"
        const transformedSections = sections.map((section) => ({
            id: section.id,
            codigo: section.codigo,
            nombre: section.curso.nombre,
            salon: section.salon,
            horario: section.horario
                ? {
                    fechaInicio: section.horario.fechaInicio,
                    fechaFin: section.horario.fechaFinal,
                    horaInicio: section.horario.horaInicio,
                    horaFin: section.horario.horaFinal,
                    dias: section.horario.dias.map((dia) => dia.dia),
                }
                : null,
            capacidad: section.capacidad,
            estudiantesInscritos: section.estudiantes.length,
            estudiantes: section.estudiantes.map((est) => ({
                id: est.estudiante.id,
                nombre: est.estudiante.usuario.nombre,
                apellido: est.estudiante.usuario.apellido,
                cedula: est.estudiante.usuario.cedula,
                email: est.estudiante.usuario.email,
                numeroTelefono: est.estudiante.numeroTelefono,
                fechaNacimiento: est.estudiante.fechaNacimiento,
                aprobado: est.aprobado ? 'Aprobado' : 'Reprobado', // Agregar el estado de aprobado
                seccionId: section.id
            })),
        }));

        return responds.success(req, res, { data: transformedSections }, 200);
    } catch (error) {
        console.error("Error fetching teacher sections:", error);
        return responds.error(req, res, { message: error.message }, 500);
    }
};


const aprobarEstudiante = async (req, res) => {
    try {
        
        const { seccionId, studentId } = req.params

        const seccion = await prisma.seccion.findFirst({
            where: {
                id: seccionId
            }
        })

        if (!seccion) {
            return responds.error(req, res, { message: 'Sección no encontrada.'}, 404);
        }

        const student = await prisma.estudiante.findFirst({
            where: {
                AND: [
                    { usuario: { deletedAt: null}},
                    { id: studentId}
                ]
            },
            include: {
                usuario: true
            }
        })

        if (!student) {
            return responds.error(req, res, { message: 'Estudiante no encontrado.'}, 404);
        }

        const relacionEstudianteSeccion = await prisma.estudiante_Seccion.findFirst({
            where: {
                idEstudiante: student.id,
                idSeccion: seccion.id,
            },
        })

        if (!relacionEstudianteSeccion) {
            return responds.error(
                req,
                res,
                { message: 'El estudiante no está inscrito en esta sección.' },
                404
            );
        }

        // Actualizar el estado de aprobado a true
        await prisma.estudiante_Seccion.update({
            where: {
                idEstudiante_idSeccion: {
                    idEstudiante: student.id,
                    idSeccion: seccion.id,
                },
            },
            data: {
                aprobado: true,
            },
        });

        return responds.success(
            req,
            res,
            { message: 'El estudiante ha sido aprobado correctamente.' },
            200
        );

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const reprobarEstudiante = async (req, res) => {
    try {
        
        const { seccionId, studentId } = req.params

        const seccion = await prisma.seccion.findFirst({
            where: {
                id: seccionId
            }
        })

        if (!seccion) {
            return responds.error(req, res, { message: 'Sección no encontrada.'}, 404);
        }

        const student = await prisma.estudiante.findFirst({
            where: {
                AND: [
                    { usuario: { deletedAt: null}},
                    { id: studentId}
                ]
            },
            include: {
                usuario: true
            }
        })

        if (!student) {
            return responds.error(req, res, { message: 'Estudiante no encontrado.'}, 404);
        }

        const relacionEstudianteSeccion = await prisma.estudiante_Seccion.findFirst({
            where: {
                idEstudiante: student.id,
                idSeccion: seccion.id,
            },
        })

        if (!relacionEstudianteSeccion) {
            return responds.error(
                req,
                res,
                { message: 'El estudiante no está inscrito en esta sección.' },
                404
            );
        }

        // Actualizar el estado de aprobado a true
        await prisma.estudiante_Seccion.update({
            where: {
                idEstudiante_idSeccion: {
                    idEstudiante: student.id,
                    idSeccion: seccion.id,
                },
            },
            data: {
                aprobado: false,
            },
        });

        return responds.success(
            req,
            res,
            { message: 'El estudiante ha sido reprobado.' },
            200
        );

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

export default {
    createSeccion,
    getSecciones,
    getStudents,
    getTeacherSections,
    aprobarEstudiante,
    reprobarEstudiante,
    updateSeccion
}