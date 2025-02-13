// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// --------------------
// Utility Modules
// --------------------
import responds from '../red/responds.js';

// Schema
import schema from '../validations/scheduleValidation.js'

// Prisma
import prisma from '../../prisma/prismaClient.js'

const createSchedule = async (req, res) => {
    try {
        // Transformar diasRepeticion en objetos si es un array de strings
        if (Array.isArray(req.body.diasRepeticion)) {
            req.body.diasRepeticion = req.body.diasRepeticion.map(dia => ({ dia }));
        }

        // Validación de los datos entrantes con Joi
        const data = await schema.validateAsync(req.body);

        // Verificando que el curso exista en la base de datos
        const course = await prisma.cursos.findUnique({
            where: {
                id: data.cursoId,
            },
        });

        if (!course) {
            return responds.error(req, res, { message: 'Curso no encontrado.' }, 404);
        }

        // Verificando la existencia de la seccion y que no tenga horario
        const seccion = await prisma.seccion.findFirst({
            where: {
                id: data.seccionId
            },
            include: {
                horario: true
            }
        })

        if (!seccion) {
            return responds.error(req, res, { message: 'La sección indicada no existe.'}, 404);
        }

        // Si el horario no es null, queriendo decir que si tiene horario, no se debe crear un nuevo horario
        if (!(seccion.horario === null)) {
            return responds.error(req, res, { message: 'La sección ya tiene horario asignado. Si desea editarlo, vaya a la gestión de horarios.'}, 401);
        }


        // Verificando que la fecha de inicio y la fecha de finalización sean válidas
        if (new Date(data.fechaInicio) > new Date(data.fechaFinal)) {
            return responds.error(req, res, { message: 'La fecha de inicio no puede ser posterior a la fecha de finalización.' }, 400);
        }

        // Creando el horario
        const newSchedule = await prisma.horario.create({
            data: {
                fechaInicio: data.fechaInicio,
                fechaFinal: data.fechaFinal,
                estado: data.estado,
                horaInicio: data.horaInicio,
                horaFinal: data.horaFinal,
                seccionId: data.seccionId,
                tipo: data.tipo
            },
        });

        // Actualizando el curso con el horarioId recién creado
        await prisma.seccion.update({
            where: {
                id: data.seccionId, // Usando el cursoId recibido en el body
            },
            data: {
                horarioId: newSchedule.id, // Estableciendo el horarioId en el curso
            },
        });

        // Creando los días de repetición
        if (data.diasRepeticion && data.diasRepeticion.length > 0) {
            const diasData = data.diasRepeticion.map(dia => ({
                dia: dia.dia,
                horarioId: newSchedule.id, // Relacionando con el horario recién creado
            }));

            await prisma.diaHorario.createMany({
                data: diasData,
            });
        }

        // Devolviendo la respuesta con el horario creado
        return responds.success(req, res, { message: 'Horario creado exitosamente.', data: newSchedule }, 201);
    } catch (error) {
        console.log(error);
        return responds.error(req, res, { message: error.message }, 500);
    }
};

// Función para transformar los días a mayúsculas y con acentos correctos
const formatDia = (dia) => {
    const diasConAcentos = {
        'lunes': 'Lunes',
        'martes': 'Martes',
        'miercoles': 'Miércoles',
        'jueves': 'Jueves',
        'viernes': 'Viernes',
        'sabado': 'Sábado',
        'domingo': 'Domingo',
    };

    // Si el día no está en la lista, lo devolvemos tal cual
    return diasConAcentos[dia.toLowerCase()] || dia;
};

// Controlador para actualizar el horario
const updateSchedule = async (req, res) => {
    try {
        // Transformar los días de repetición en objetos con la propiedad 'dia'
        if (Array.isArray(req.body.diasRepeticion)) {
            req.body.diasRepeticion = req.body.diasRepeticion.map(dia => ({ dia: formatDia(dia) }));
        }


        console.log(req.body)

        const { cursoId, seccionId } = req.params;
        const { fechaInicio, fechaFinal, horaInicio, horaFinal, diasRepeticion, tipo } = req.body;

        // Validación de los datos entrantes con Joi
        const data = await schema.validateAsync(req.body);

        // Verificando que el curso exista en la base de datos
        const course = await prisma.cursos.findUnique({
            where: {
                id: parseInt(cursoId), // Utilizamos parseInt ya que es un número
            },
        });

        if (!course) {
            return responds.error(req, res, { message: 'Curso no encontrado.' }, 404);
        }

        // Verificando que la sección exista en la base de datos
        const seccion = await prisma.seccion.findUnique({
            where: {
                id: parseInt(seccionId), // Utilizamos parseInt ya que es un número
            },
        });

        if (!seccion) {
            return responds.error(req, res, { message: 'Sección no encontrada.' }, 404);
        }

        // Verificando que la fecha de inicio y la fecha de finalización sean válidas
        if (new Date(fechaInicio) > new Date(fechaFinal)) {
            return responds.error(req, res, { message: 'La fecha de inicio no puede ser posterior a la fecha de finalización.' }, 400);
        }

        // Actualizando el horario de la sección
        const updatedSchedule = await prisma.horario.update({
            where: {
                id: seccion.horarioId, // Usamos el horarioId que está asociado con la sección
            },
            data: {
                fechaInicio,
                fechaFinal,
                horaInicio,
                horaFinal,
                tipo,
            },
        });

        // Actualizando los días de repetición
        if (diasRepeticion && diasRepeticion.length > 0) {
            // Primero eliminamos los días antiguos
            await prisma.diaHorario.deleteMany({
                where: {
                    horarioId: updatedSchedule.id,
                },
            });

            // Ahora insertamos los nuevos días
            const diasData = diasRepeticion.map(dia => ({
                dia: dia.dia,
                horarioId: updatedSchedule.id,
            }));

            await prisma.diaHorario.createMany({
                data: diasData,
            });
        }

        // Devolviendo la respuesta con el horario actualizado
        return responds.success(req, res, { message: 'Horario actualizado exitosamente.', data: updatedSchedule }, 200);

    } catch (error) {
        console.log(error);
        return responds.error(req, res, { message: error.message }, 500);
    }
};

export default {
    createSchedule,
    updateSchedule
}