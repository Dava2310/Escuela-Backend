import { Router } from 'express'
import ctrl from '../controllers/users.controller.js'
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js'

const router = Router();

// Ver los datos del usuario actual
router.get('/api/users/current', auth.ensureAuthenticated, ctrl.viewUser);

// Cambiar los datos del usuario actual
router.patch('/api/users/current', auth.ensureAuthenticated, ctrl.changePersonalData);

// Recuperar contraseña

// Paso1: Enviar Email
router.patch('/api/users/recover', ctrl.recoverStepOne)

// Paso 2.1: Conseguir la pregunta de seguridad asociado al ID de usuario
router.get('/api/users/recover/:id', validate.validateAndConvertId('id'), ctrl.recoverStepTwoGet)

// Paso 2.2: Enviar Respuesta de seguridad, nueva contraseña y confirmación
router.put('/api/users/recover', ctrl.recoverStepTwo)

// Gestion de usuario como administrador
router.get('/api/users/', auth.ensureAuthenticated, auth.authorize(['admin']), ctrl.getUsers)

router.get('/api/users/:userId', auth.ensureAuthenticated, auth.authorize(['admin']), validate.validateAndConvertId('userId'), ctrl.getOneUser)

router.patch('/api/users/:userId', auth.ensureAuthenticated, auth.authorize(['admin']), validate.validateAndConvertId('userId'), ctrl.editUser)

router.delete('/api/users/:userId', auth.ensureAuthenticated, auth.authorize(['admin']), validate.validateAndConvertId('userId'), ctrl.deleteUser)


export default router;