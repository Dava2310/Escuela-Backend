import Joi from "joi";

const inscripcion = Joi.object({
    seccionId: Joi.number().required(),
    cursoId: Joi.number().required(),
    referenciaPago: Joi.string().required(),
    fechaExpedicion: Joi.string().required(),
    banco: Joi.string().required(),
    monto: Joi.number().required(),
})

export default { 
    inscripcion,
}