import Joi from "joi";

const certificate = Joi.object({
    titulo: Joi.string().required(),
    descripcion: Joi.string().required(),
    fechaExpedicion: Joi.string().required()
})

export default {
    certificate
}