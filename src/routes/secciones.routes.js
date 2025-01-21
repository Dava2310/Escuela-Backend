import { Router } from "express"
import ctrl from '../controllers/secciones.controller.js'
import auth from "../middleware/auth.js"
import validate from "../middleware/validate.js"

const router = Router();

// Ruta POST para crear una seccion
router.post('/', auth.ensureAuthenticated, ctrl.createSeccion);

export default router;