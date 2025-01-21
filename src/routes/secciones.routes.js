import { Router } from "express"
import ctrl from '../controllers/secciones.controller.js'
import auth from "../middleware/auth.js"
import validate from "../middleware/validate.js"

const router = Router();

// Ruta POST para crear una seccion
router.post('/', auth.ensureAuthenticated, ctrl.createSeccion);

// Ruta GET para conseguir las secciones de un curso
router.get('/:cursoId', auth.ensureAuthenticated, validate.validateAndConvertId('cursoId'), ctrl.getSecciones)

export default router;