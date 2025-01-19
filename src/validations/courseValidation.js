import Joi from "joi";

const courseRegister = Joi.object({
    nombre: Joi.string().required(),
    codigo: Joi.string().required(),
    descripcion: Joi.string().required(),
    profesorId: Joi.number().required(),
})

export default { 
    courseRegister
};