import { Router } from "express"
import ctrl from "../controllers/inscripciones.controller.js"
import auth from "../middleware/auth.js"
import validate from "../middleware/validate.js"

const router = Router();

// Ruta POST para que un estudiante se inscriba
router.post('/', auth.ensureAuthenticated, ctrl.createInscripcion);

export default router;
