// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// --------------------
// Utility Modules
// --------------------
import responds from '../red/responds.js';

// Schema
import schema from '../validations/inscripcionValidation.js'

// Prisma
import prisma from '../../prisma/prismaClient.js'

const getInscripciones = async (req, res) => {
    try {

        const inscripciones = await prisma.inscripcion.findMany({
            include: {
                estudiante: {
                    include: {
                        usuario: true
                    }
                },
                seccion: true
            },
            where: {
                deletedAt: null
            }
        })

        for (let inscripcion of inscripciones) {
            inscripcion.cedulaEstudiante = inscripcion.estudiante.usuario.cedula;
            inscripcion.codigoSeccion = inscripcion.seccion.codigo;
        }

        return responds.success(req, res, { data: inscripciones }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const getOneInscripcion = async (req, res) => {
    try {

        const { inscripcionId } = req.params;

        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                AND: [
                    { id: inscripcionId },
                    { deletedAt: null }
                ]

            },
            include: {
                estudiante: true,
                seccion: true
            },
        })

        if (!inscripcion) {
            return responds.error(req, res, { message: 'Inscripción no encontrada.' }, 404);
        }

        return responds.success(req, res, { data: inscripcion }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const createInscripcion = async (req, res) => {
    try {
        const data = await schema.inscripcion.validateAsync(req.body); // Validar datos de entrada
        const userId = req.user.id;

        // Obtener el estudiante relacionado con el usuario
        const estudiante = await prisma.estudiante.findUnique({
            where: { usuarioId: userId }
        });

        if (!estudiante) {
            return responds.error(req, res, { message: 'Estudiante no encontrado.' }, 404);
        }

        // Crear la inscripción sin crear la relación Estudiante_Seccion
        const newInscription = await prisma.inscripcion.create({
            data: {
                referenciaPago: data.referenciaPago,
                fechaExpedicion: new Date(data.fechaExpedicion),
                banco: data.banco,
                monto: data.monto,
                seccionId: data.seccionId,
                estudianteId: estudiante.id,
                estado: 'En Espera' // Estado inicial predeterminado
            }
        });

        // Respuesta de éxito
        return responds.success(req, res, { message: 'Inscripción creada exitosamente.', data: newInscription }, 201);
    } catch (error) {
        console.error(error);
        return responds.error(req, res, { message: error.message }, 500);
    }
};

const updateInscripcion = async (req, res) => {
    try {

        const data = await schema.updateInscripcion.validateAsync(req.body);

        const { inscripcionId } = req.params;

        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                AND: [
                    { deletedAt: null },
                    { id: inscripcionId }
                ]
            }
        })

        if (!inscripcion) {
            return responds.error(req, res, { message: 'Inscripción no encontrada.' }, 404);
        }

        // Realizando la modificacion
        const updatedInscripcion = await prisma.inscripcion.update({
            where: {
                id: inscripcion.id
            },
            data: {
                banco: data.banco,
                fechaExpedicion: data.fechaExpedicion,
                monto: data.monto,
                referenciaPago: data.referenciaPago
            }
        })

        return responds.success(req, res, { message: 'Inscripción actualizada exitosamente.' }, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const deleteInscripcion = async (req, res) => {
    try {
        const { inscripcionId } = req.params;

        // Buscar la inscripción
        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                AND: [
                    { deletedAt: null },
                    { id: inscripcionId }
                ]
            }
        });

        if (!inscripcion) {
            return responds.error(req, res, { message: 'Inscripción no encontrada.' }, 404);
        }

        // Eliminar la relación Estudiante_Seccion si existe
        const relacionEstudianteSeccion = await prisma.estudiante_Seccion.findFirst({
            where: {
                idEstudiante: inscripcion.estudianteId,
                idSeccion: inscripcion.seccionId
            }
        });

        if (relacionEstudianteSeccion) {
            await prisma.estudiante_Seccion.delete({
                where: {
                    idEstudiante_idSeccion: {
                        idEstudiante: inscripcion.estudianteId,
                        idSeccion: inscripcion.seccionId
                    }
                }
            });
        }

        // Marcar la inscripción como eliminada
        await prisma.inscripcion.update({
            where: {
                id: inscripcionId
            },
            data: {
                deletedAt: new Date()
            }
        });

        return responds.success(req, res, { message: 'Inscripción eliminada exitosamente.' }, 200);
    } catch (error) {
        console.error(error);
        return responds.error(req, res, { message: error.message }, 500);
    }
};

const aprobarInscripcion = async (req, res) => {
    try {
        const { inscripcionId } = req.params;

        // Buscar la inscripción
        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                AND: [
                    { deletedAt: null },
                    { id: inscripcionId }
                ]
            }
        });

        if (!inscripcion) {
            return responds.error(req, res, { message: 'Inscripción no encontrada.' }, 404);
        }

        // Verificar si ya está aprobada
        if (inscripcion.estado === 'Aprobada') {
            return responds.error(req, res, { message: 'La inscripción ya está aprobada.' }, 400);
        }

        // Usar una transacción para aprobar la inscripción y crear la relación Estudiante_Seccion
        await prisma.$transaction(async (prisma) => {
            // Aprobar la inscripción
            await prisma.inscripcion.update({
                where: { id: inscripcion.id },
                data: { estado: 'Aprobada' }
            });

            // Crear la relación Estudiante_Seccion
            await prisma.estudiante_Seccion.create({
                data: {
                    idEstudiante: inscripcion.estudianteId,
                    idSeccion: inscripcion.seccionId
                }
            });
        });

        return responds.success(req, res, { message: 'Inscripción aprobada exitosamente.' }, 200);
    } catch (error) {
        console.error(error);
        return responds.error(req, res, { message: error.message }, 500);
    }
};

const noAprobarInscripcion = async (req, res) => {
    try {
        
        const { inscripcionId } = req.params;

        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                AND: [
                    { deletedAt: null },
                    { id: inscripcionId }
                ]
            }
        })

        if (!inscripcion) {
            return responds.error(req, res, { message: 'Inscripción no encontrada.' }, 404);
        }

        // Realizando la aprobacion
        const updatedInscripcion = await prisma.inscripcion.update({
            where: {
                id: inscripcion.id
            },
            data: {
                estado: 'No Aprobada'
            }
        })

        return responds.success(req, res, {message: 'Inscripción desaaprobada exitosamente.'}, 200);

    } catch (error) {
        return responds.error(req, res, { message: error.message}, 500);
    }
}

export default {
    getInscripciones,
    getOneInscripcion,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion,
    aprobarInscripcion,
    noAprobarInscripcion
}
