import { Router } from 'express'
import auth from '../middleware/auth.js';

// Controller
import ctrl from '../controllers/auth.controller.js'
import responds from '../red/responds.js';
const {registerUser, loginUser, refreshToken, logoutUser, changePassword} = ctrl

const router = Router();

// Registro de Usuario
router.post('/api/auth/register', registerUser);

// Iniciar Sesión
router.post('/api/auth/login', loginUser);

// Verificar la validez del token
router.get('/api/auth/verify-token', auth.ensureAuthenticated, (req, res) => {
    try {
        responds.success(req, res, {message: "Token is valid"}, 200);
    } catch (error) {
        responds.error(req, res, {message: error.message}, 400);
    }
})

// Cambiar token de acceso mediante el token de refresco
router.post('/api/auth/refresh-token', refreshToken);

// Cerrar Sesion
router.get('/api/auth/logout', auth.ensureAuthenticated, logoutUser);

// Cambiar contraseña
router.patch('/api/auth/changePassword', auth.ensureAuthenticated, changePassword);



export default router;