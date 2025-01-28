import responds from '../red/responds.js';

// --------------------
// Prisma Module
// --------------------
import prisma from '../../prisma/prismaClient.js'

// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// Schema
import Schemas from '../validations/userValidation.js'
import { hashSync } from 'bcrypt'; // Bcrypt for hashing and comparing passwords
const schema = Schemas.userEdit;

const getUsers = async (req, res) => {

    try {
        const allUsuarios = await prisma.usuario.findMany();
        return responds.success(req, res, { data: allUsuarios }, 200);
    }
    catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
}


const getOneUser = async (req, res) => {

    try {
        const { userId } = req.params;

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: userId
            }
        });

        if (!usuario) {
            return responds.error(req, res, { message: 'Usuario no encontrado.' }, 404);
        }

        return responds.success(req, res, { data: usuario }, 200);
    } catch (error) {
        // Respond with a generic error message for other errors
        return responds.error(req, res, { message: error.message }, 500);
    }

}

/**
 * Retrieve the authenticated user's information.
 * 
 * This function retrieves the current user's information based on their JWT authentication.
 * If the user is not found, it returns an error response.
 * 
 * @param {Object} req - Express request object containing user info after authentication
 * @param {Object} res - Express response object to send the result
 * @returns {Object} - JSON response with user data or an error message
 */
const viewUser = async (req, res) => {
    try {
        // Getting user after authentication with JWT
        const user = await prisma.usuario.findFirst({
            where: {
                id: req.user.id
            }
        })

        if (!user) {
            return responds.error(req, res, { message: 'No fue encontrado el usuario. Intente de nuevo.' }, 401);
        }

        const data = user

        const tipoUsuario = user.tipoUsuario;

        if (tipoUsuario === 'estudiante') {
            const estudiante = await prisma.estudiante.findFirst({
                where: {
                    usuarioId: user.id
                }
            })

            data.fechaNacimiento = estudiante.fechaNacimiento;
            data.direccion = estudiante.direccion;
            data.numeroTelefono = estudiante.numeroTelefono;
        }
        else if (tipoUsuario === 'profesor') {
            const profesor = await prisma.profesor.findFirst({
                where: {
                    usuarioId: user.id
                }
            });

            data.fechaNacimiento = profesor.fechaNacimiento;
            data.direccion = profesor.direccion;
            data.numeroTelefono = profesor.numeroTelefono;
            data.profesion = profesor.profesion;
        }

        return responds.success(req, res, { data }, 200);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const editUser = async (req, res) => {
    try {

        const { userId } = req.params;

        // Searching for the user
        const user = await prisma.usuario.findUnique({ where: { id: userId } });

        if (!user) {
            return responds.error(req, res, { message: 'Usuario no encontrado.' }, 404);
        }

        // Validating the request body
        const result = await schema.validateAsync(req.body);

        // Searching for duplicated email
        const duplicatedEmail = await prisma.usuario.findUnique({
            where: {
                email: result.email,
                NOT: { id: userId }
            }
        });

        if (duplicatedEmail) {
            return responds.error(req, res, { message: 'Este email ya está en uso.' }, 409);
        }

        const duplicatedCedula = await prisma.usuario.findUnique({
            where: {
                cedula: result.cedula,
                NOT: {
                    id: userId
                }
            }
        })

        if (duplicatedCedula) {
            return responds.error(req, res, { message: 'Cedula ya está en uso.' }, 409);
        }

        // Making the update
        const updatedUser = await prisma.usuario.update({
            where: { id: userId },
            data: result
        });

        // Return the updated productor
        return responds.success(req, res, { data: updatedUser, message: "Usuario actualizado de forma exitosa." }, 200);

    } catch (error) {

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.message }, 422)
        }

        return res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: userId
            }
        });

        if (!usuario) {
            return responds.error(req, res, { message: 'Usuario no encontrado.' }, 404);
        }

        // Tenemos que verificar que el usuario no este intentando eliminar su propio usuario
        if (req.user.id === userId) {
            return responds.error(req, res, { message: 'No puede eliminar su propio usuario.' }, 403);
        }

        // Primero tenemos que eliminar todos los invalid tokens y refresh tokens que tienen ese ID de usuario
        await prisma.invalidToken.deleteMany({
            where: {
                userId: userId
            }
        });

        await prisma.refreshToken.deleteMany({
            where: {
                userId: userId
            }
        });

        await prisma.usuario.delete({
            where: {
                id: userId
            }
        })

        return responds.success(req, res, { message: "Usuario eliminado con éxito." }, 200);
    } catch (error) {
        // Respond with a generic error message for other errors
        return responds.error(req, res, { message: error.message }, 500);
    }
}

const changePersonalData = async (req, res) => {
    try {
        
        // Buscando el usuario actual
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: req.user.id
            }
        })

        if (!usuario) {
            return responds.error(req, res, {message: 'Ocurrió un error. Intente de nuevo.'}, 404);
        }

        // Obteniendo los datos y validandolos
        const datosUsuario = await Schemas.userEdit.validateAsync(req.body);

        // Verificando la duplicidad de email y correo
        const duplicatedEmail = await prisma.usuario.findUnique({
            where: {
                email: datosUsuario.email,
                NOT: { id: usuario.id }
            }
        });

        if (duplicatedEmail) {
            return responds.error(req, res, { message: 'Este email ya está en uso.' }, 409);
        }

        const duplicatedCedula = await prisma.usuario.findUnique({
            where: {
                cedula: datosUsuario.cedula,
                NOT: {
                    id: usuario.id
                }
            }
        })

        if (duplicatedCedula) {
            return responds.error(req, res, {message: 'La cedula ya está en uso.'}, 409);
        }

        // Validando los datos de estudiante o profesor segun corresponda
        let dataEspecifica;

        if (usuario.tipoUsuario === 'estudiante') {
            dataEspecifica = await Schemas.estudianteRegister.validateAsync({
                direccion: datosUsuario.direccion,
                numeroTelefono: datosUsuario.numeroTelefono,
                fechaNacimiento: datosUsuario.fechaNacimiento,
            })
        } else if (usuario.tipoUsuario === 'profesor') {
            dataEspecifica = await Schemas.profesorRegister.validateAsync({
                direccion: datosUsuario.direccion,
                numeroTelefono: datosUsuario.numeroTelefono,
                fechaNacimiento: datosUsuario.fechaNacimiento,
                profesion: datosUsuario.profesion
            })
        }
        
        // Haciendo los cambios a la entidad usuario
        await prisma.usuario.update({
            where: {
                id: usuario.id
            },
            data: {
                nombre: datosUsuario.nombre,
                apellido: datosUsuario.apellido,
                email: datosUsuario.email,
                cedula: datosUsuario.cedula,
                preguntaSeguridad: datosUsuario.preguntaSeguridad,
                respuestaSeguridad: datosUsuario.respuestaSeguridad
            }
        })

        // Haciendo los cambios a la entidad especifica
        if (usuario.tipoUsuario === 'estudiante') {
            await prisma.estudiante.updateMany({
                where: {
                    usuarioId: usuario.id
                },
                data: {
                    direccion: dataEspecifica.direccion,
                    fechaNacimiento: new Date(dataEspecifica.fechaNacimiento),
                    numeroTelefono: dataEspecifica.numeroTelefono,
                }
            })
        } else if (usuario.tipoUsuario === 'profesor') {
            await prisma.profesor.updateMany({
                where: {
                    usuarioId: usuario.id
                },
                data: {
                    profesion: dataEspecifica.profesion,
                    direccion: dataEspecifica.direccion,
                    numeroTelefono: dataEspecifica.numeroTelefono,
                    fechaNacimiento: new Date(dataEspecifica.fechaNacimiento),
                }
            })
        }

        return responds.success(req, res, {message: 'Actualización de datos exitosa.'}, 200);

    } catch (error) {

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.message }, 422)
        }

        return responds.error(req, res, { message: error.message }, 500);
    }
}

const recoverStepOne = async (req, res) => {
    try {
        
        // Primero, recibimos el email y verificamos que sea uno valido
        const data = await Schemas.recuperarPassword_1.validateAsync(req.body);

        // Segundo, buscamos un usuario que tenga el correo ingresado por usuario
        const usuario = await prisma.usuario.findFirst({
            where: {
                email: data.email
            }
        })

        // Si no existe un usuario, error
        if (!usuario) {
            return responds.error(req, res, {message: 'No se pudo encontrar el usuario.'}, 404);
        }

        // En caso de existir, mandamos un mensaje de exito
        return responds.success(req, res, {message: 'Usuario encontrado.', data: {id: usuario.id}}, 200);

    } catch (error) {

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.message }, 422)
        }

        return responds.error(req, res, {message: error.message}, 500);
    }
}

const recoverStepTwoGet = async (req, res) => {
    try {
        
        // Recibimos el ID de usuario
        const { id } = req.params;

        // Buscamos el usuario
        const usuario = await prisma.usuario.findFirst({
            where: {
                id: id
            }
        })

        // Si no existe un usuario, error
        if (!usuario) {
            return responds.error(req, res, {message: 'No se pudo encontrar el usuario.'}, 404);
        }

        // En caso de existir, mandamos la pregunta de seguridad
        return responds.success(req, res, {data: {preguntaSeguridad: usuario.preguntaSeguridad}}, 200);

    } catch (error) {
        return responds.error(req, res, {message: error.message}, 500);
    }
}

const recoverStepTwo = async (req, res) => {
    try {
        
        // Recibimos la respuesta de seguridad y el resto de los datos
        const data = await Schemas.recuperarPassword_2.validateAsync(req.body);

        // Verificamos que usuario es al que se le hara la recuperacion
        const usuario = await prisma.usuario.findFirst({
            where: {
                email: data.email
            }
        })

        // Si no existe un usuario, error
        if (!usuario) {
            return responds.error(req, res, {message: 'No se pudo encontrar el usuario.'}, 404);
        }

        // Hacemos la validacion de las respuestas de seguridad
        if (usuario.respuestaSeguridad !== data.respuestaSeguridad) {
            return responds.error(req, res, {message: 'La respuesta de seguridad no coincide.'}, 401);
        }

        // En caso de que si coincidan las respuestas de seguridad, entonces efectuamos el cambio de contraseña

        // Encriptamos la nueva contraseña
        const newPassword = hashSync(data.newPassword, 10);

        // Hacemos el cambio de contraseña
        await prisma.usuario.update({
            where: {
                id: usuario.id
            },
            data: {
                password: newPassword
            }
        })
        
        return responds.success(req, res, {message: 'Recuperacion exitosa.'}, 200);

    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.message }, 422)
        }

        return responds.error(req, res, {message: error.message}, 500);
    }
}

export default { viewUser, editUser, deleteUser, getUsers, getOneUser, changePersonalData, recoverStepOne, recoverStepTwoGet, recoverStepTwo };

