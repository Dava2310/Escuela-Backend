import {Router} from "express"
import ctrl from "../controllers/schedules.controller.js"
import auth from "../middleware/auth.js" 
import validate from "../middleware/validate.js"

const router = Router();

// Ruta POST para crear un horario
router.post('/', auth.ensureAuthenticated, ctrl.createSchedule);

// Ruta para actualizar el horario de una sección
router.patch('/:cursoId/secciones/:seccionId/horario', auth.ensureAuthenticated, ctrl.updateSchedule);


export default router;