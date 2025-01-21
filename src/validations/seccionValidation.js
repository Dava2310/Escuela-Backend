import Joi from "joi";

const seccionRegister = Joi.object({
    codigo: Joi.string().required(),
    capacidad: Joi.number().min(1),
    salon: Joi.string().required(),
    profesorId: Joi.number().required(),
    cursoId: Joi.number().required()
})

export default seccionRegister;