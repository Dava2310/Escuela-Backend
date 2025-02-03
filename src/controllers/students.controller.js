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

const getStudents = async (req, res) => {
    try {
        // Conseguir todos los estudiantes activos (usuario no eliminado)
        const students = await prisma.estudiante.findMany({
            where: {
                usuario: {
                    deletedAt: null  // Filtrar usuarios no eliminados
                }
            },
            include: {
                usuario: true
            }
        });

        const formattedStudents = students.map(student => ({
            id: student.id,
            fechaNacimiento: formatDate(student.fechaNacimiento),
            numeroTelefono: student.numeroTelefono,
            nombre: student.usuario.nombre,
            apellido: student.usuario.apellido,
            email: student.usuario.email,
            cedula: student.usuario.cedula
        }));

        return responds.success(req, res, { data: formattedStudents }, 200);
    } catch (error) {
        console.log(error);
        responds.error(req, res, { message: error.message }, 500);
    }
};

const getOneStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await prisma.estudiante.findFirst({
            where: {
                AND: [
                    { id: studentId },
                    { usuario: { deletedAt: null } }
                ]
            },
            include: {
                usuario: true
            }
        });

        if (!student) {
            return responds.error(req, res, { message: 'El estudiante no fue encontrado.' }, 404);
        }

        const formattedStudent = {
            id: student.id,
            fechaNacimiento: formatDate(student.fechaNacimiento),
            numeroTelefono: student.numeroTelefono,
            nombre: student.usuario.nombre,
            apellido: student.usuario.apellido,
            email: student.usuario.email,
            cedula: student.usuario.cedula,
            direccion: student.direccion
        };

        return responds.success(req, res, { data: formattedStudent }, 200);
    } catch (error) {
        responds.error(req, res, { message: error.message }, 500);
    }
}

const updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await prisma.estudiante.findFirst({
            where: {
                AND: [
                    { id: studentId },
                    { usuario: { deletedAt: null } }
                ]
            },
            include: {
                usuario: true
            }
        });

        if (!student) {
            return responds.error(req, res, { message: 'El estudiante no fue encontrado.' }, 404);
        }

        // Consiguiendo la data y validando contra el esquema
        const data = await schema.estudianteEdit.validateAsync(req.body);

        const updatedStudent = await prisma.estudiante.update({
            where: {
                id: student.id
            },
            data: {
                fechaNacimiento: revertDateFormat(data.fechaNacimiento),
                direccion: data.direccion,
                numeroTelefono: data.numeroTelefono,
                usuario: {
                    update: {
                        nombre: data.nombre,
                        apellido: data.apellido,
                        email: data.email,
                        cedula: data.cedula
                    }
                }
            }
        });

        return responds.success(req, res, { data: updatedStudent, message: "Estudiante actualizado exitosamente." }, 200);
    } catch (error) {

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.details[0].message }, 422);
        }

        responds.error(req, res, { message: error.message }, 500);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Buscar al estudiante incluyendo su relación con usuario
        const student = await prisma.estudiante.findUnique({
            where: { id: studentId },
            include: { usuario: true }  // Incluir datos del usuario para acceder al usuarioId
        });

        if (!student) {
            return responds.error(req, res, { message: 'El estudiante no fue encontrado.' }, 404);
        }

        // Actualizar la eliminación lógica del usuario relacionado
        await prisma.usuario.update({
            where: { id: student.usuarioId },
            data: { deletedAt: new Date() }  // Marcar como eliminado
        });

        return responds.success(req, res, { message: 'Estudiante eliminado exitosamente.' }, 200);
    } catch (error) {
        responds.error(req, res, { message: error.message }, 500);
    }
};


export default {
    getStudents,
    getOneStudent,
    updateStudent,
    deleteStudent
}