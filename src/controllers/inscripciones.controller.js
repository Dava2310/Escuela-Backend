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

const createInscripcion = async (req, res) => {
    try {
        const data = await schema.inscripcion.validateAsync(req.body);  // Validar datos de entrada
        const userId = req.user.id;

        // Obtener el estudiante relacionado con el usuario
        const estudiante = await prisma.estudiante.findUnique({
            where: { usuarioId: userId },
            include: { secciones: true }
        });

        if (!estudiante) {
            return responds.error(req, res, { message: 'Estudiante no encontrado.' }, 404);
        }

        // Usar transacción para crear inscripción y relación Estudiante_Seccion
        await prisma.$transaction(async (prisma) => {
            // Crear la inscripción
            const newInscription = await prisma.inscripcion.create({
                data: {
                    referenciaPago: data.referenciaPago,
                    fechaExpedicion: new Date(data.fechaExpedicion),
                    banco: data.banco,
                    monto: data.monto,
                    seccionId: data.seccionId,
                    estudianteId: estudiante.id
                }
            });

            // Relacionar estudiante y sección
            await prisma.estudiante_Seccion.create({
                data: {
                    idEstudiante: estudiante.id,
                    idSeccion: data.seccionId
                }
            });
        });

        // Respuesta de éxito
        return responds.success(req, res, { message: 'Inscripción exitosa.' }, 201);
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
};

export default {
    createInscripcion
}