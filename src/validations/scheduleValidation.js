import Joi from "joi";

const horarioSchema = Joi.object({
  // Fecha de inicio del curso
  fechaInicio: Joi.date().required()
    .messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida.',
      'any.required': 'La fecha de inicio es obligatoria.'
    }),

  // Fecha de finalización del curso
  fechaFinal: Joi.date().greater(Joi.ref('fechaInicio')).required()
    .messages({
      'date.greater': 'La fecha de finalización debe ser posterior a la fecha de inicio.',
      'any.required': 'La fecha de finalización es obligatoria.'
    }),

  // Estado del horario
  estado: Joi.boolean().default(true),

  // Capacidad de estudiantes
  capacidad: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'La capacidad debe ser un número entero.',
      'number.min': 'La capacidad debe ser al menos 1.',
      'any.required': 'La capacidad es obligatoria.'
    }),

  // Tipo de horario: Presencial o Virtual
  tipo: Joi.string().valid('Presencial', 'Virtual').required()
    .messages({
      'any.only': 'El tipo de horario debe ser "Presencial" o "Virtual".',
      'any.required': 'El tipo de horario es obligatorio.'
    }),

  // ID del curso asociado
  cursoId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'El ID del curso debe ser un número entero.',
      'any.required': 'El ID del curso es obligatorio.'
    }),

  // Validación para los días del horario
  dias: Joi.array().items(
    Joi.object({
      dia: Joi.string().valid('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo').required()
        .messages({
          'any.only': 'El día debe ser uno de: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo.',
          'any.required': 'El día es obligatorio.'
        }),
      horaInicio: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({
          'string.pattern.base': 'La hora de inicio debe estar en formato HH:MM (24 horas).',
          'any.required': 'La hora de inicio es obligatoria.'
        }),
      horaFinal: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({
          'string.pattern.base': 'La hora de finalización debe estar en formato HH:MM (24 horas).',
          'any.required': 'La hora de finalización es obligatoria.'
        }),
      salon: Joi.string().min(1).max(100).required()
        .messages({
          'string.base': 'El salón debe ser un texto.',
          'any.required': 'El salón es obligatorio.'
        })
    })
  ).min(1).required()
    .messages({
      'array.min': 'Debe haber al menos un día definido para el horario.',
      'any.required': 'Los días del horario son obligatorios.'
    })
});

export default horarioSchema;