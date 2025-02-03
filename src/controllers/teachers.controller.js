// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// --------------------
// Utility Modules
// --------------------
import responds from '../red/responds.js';

// Schema
import schema from '../validations/userValidation.js'

// Prisma
import prisma from '../../prisma/prismaClient.js'

const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Obtenemos los componentes de la fecha en UTC para evitar el desfase por zona horaria
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
};

const revertDateFormat = (formattedDate) => {
    const [day, month, year] = formattedDate.split('/').map(Number);

    // Convertir a formato ISO 8601
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.toISOString(); // Esto devolverá la fecha en formato "yyyy-mm-ddT00:00:00.000Z"
};

const getTeachers = async (req, res) => {
    try {
        // Conseguir todos los profesores activos (usuario no eliminado)
        const teachers = await prisma.profesor.findMany({
            where: {
                usuario: {
                    deletedAt: null  // Filtrar usuarios no eliminados
                }
            },
            include: {
                usuario: true
            }
        });

        const formattedTeachers = teachers.map(teacher => ({
            id: teacher.id,
            fechaNacimiento: formatDate(teacher.fechaNacimiento),
            numeroTelefono: teacher.numeroTelefono,
            nombre: teacher.usuario.nombre,
            apellido: teacher.usuario.apellido,
            email: teacher.usuario.email,
            cedula: teacher.usuario.cedula,
            profesion: teacher.profesion

        }));

        return responds.success(req, res, { data: formattedTeachers }, 200);
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const getOneTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;

        const teacher = await prisma.profesor.findUnique({
            where: {
                id: teacherId
            },
            include: {
                usuario: true
            }
        });

        if (!teacher) {
            return responds.error(req, res, { message: 'Profesor no encontrado' }, 404);
        }

        const formattedTeacher = {
            id: teacher.id,
            fechaNacimiento: formatDate(teacher.fechaNacimiento),
            numeroTelefono: teacher.numeroTelefono,
            nombre: teacher.usuario.nombre,
            apellido: teacher.usuario.apellido,
            email: teacher.usuario.email,
            cedula: teacher.usuario.cedula,
            profesion: teacher.profesion,
            direccion: teacher.direccion
        };

        return responds.success(req, res, { data: formattedTeacher }, 200);
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const teacherData = req.body;

        // Validar datos de entrada
        const { error } = schema.profesorEdit.validate(teacherData);

        if (error) {
            return responds.error(req, res, { message: error.details[0].message }, 422);
        }

        // Convertir fecha de nacimiento a formato ISO 8601
        teacherData.fechaNacimiento = revertDateFormat(teacherData.fechaNacimiento);

        // Actualizar datos del profesor
        const updatedTeacher = await prisma.profesor.update({
            where: {
                id: teacherId
            },
            data: {
                fechaNacimiento: teacherData.fechaNacimiento,
                direccion: teacherData.direccion,
                numeroTelefono: teacherData.numeroTelefono,
                profesion: teacherData.profesion,
                usuario: {
                    update: {
                        nombre: teacherData.nombre,
                        apellido: teacherData.apellido,
                        email: teacherData.email,
                        cedula: teacherData.cedula
                    }
                }
            }
        });

        return responds.success(req, res, { data: updatedTeacher, message: 'Profesor actualizado correctamente.' }, 200);
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.details[0].message }, 422);
        }

        return responds.error(req, res, { message: error.message }, 500);
    }
}

const deleteTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;

        // Buscar al estudiante incluyendo su relación con usuario
        const teacher = await prisma.profesor.findUnique({
            where: { id: teacherId },
            include: { usuario: true }  // Incluir datos del usuario para acceder al usuarioId
        });

        if (!teacher) {
            return responds.error(req, res, { message: 'El profesor no fue encontrado.' }, 404);
        }

        // Actualizar la eliminiación del usuario asociado al profesor
        await prisma.usuario.update({
            where: {
                id: teacher.usuarioId
            },
            data: {
                deletedAt: new Date()
            }
        });

        return responds.success(req, res, { message: 'Profesor eliminado correctamente.' }, 200);
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

export default {
    getTeachers,
    getOneTeacher,
    updateTeacher,
    deleteTeacher
}