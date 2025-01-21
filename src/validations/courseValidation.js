import Joi from "joi";

const courseRegister = Joi.object({
    nombre: Joi.string().required(),
    codigo: Joi.string().required(),
    descripcion: Joi.string().required(),
    categoria: Joi.string().required()
})

const courseEdit = Joi.object({
    nombre: Joi.string().required(),
    codigo: Joi.string().required(),
    categoria: Joi.string().required()
})

export default { 
    courseRegister,
    courseEdit
};